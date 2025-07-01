import { VertexAI, GenerativeModel, ChatSession } from '@google-cloud/vertexai';
import { Storage } from '@google-cloud/storage';
import { config } from '../config';
import { GeneratedContent, AIPromptContext, Bond, StorageUploadResult } from '../types';
import { FlowService } from './flow.service';

export class IAService {
  private vertexAI: VertexAI;
  private textModel: GenerativeModel;
  private imageModel: GenerativeModel;
  private storage: Storage;
  private flowService: FlowService;

  constructor() {
    this.vertexAI = new VertexAI({
      project: config.gcp.projectId,
      location: config.vertexAI.location,
    });

    this.textModel = this.vertexAI.getGenerativeModel({
      model: config.vertexAI.textModel,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    this.imageModel = this.vertexAI.getGenerativeModel({
      model: config.vertexAI.imageModel,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.8,
        topP: 0.85,
      },
    });

    this.storage = new Storage({
      projectId: config.gcp.projectId,
    });

    this.flowService = new FlowService();
  }

  /**
   * Genera un informe de misión basado en el contexto del bond
   */
  async generateMissionReport(context: AIPromptContext): Promise<string> {
    try {
      const prompt = this.buildMissionReportPrompt(context);
      
      const result = await this.textModel.generateContent(prompt);
      const response = result.response;
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No content generated');
      }

      return response.candidates[0].content.parts[0].text || '';
    } catch (error) {
      console.error('Error generating mission report:', error);
      throw new Error(`Failed to generate mission report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Genera arte SVG para el Corazón Clandestino
   */
  async generateBondArt(artSeed: string[], bondLevel: number): Promise<string> {
    try {
      const prompt = this.buildArtPrompt(artSeed, bondLevel);
      
      const result = await this.imageModel.generateContent(prompt);
      const response = result.response;
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No art generated');
      }

      // Extraer el código SVG de la respuesta
      const generatedText = response.candidates[0].content.parts[0].text || '';
      const svgContent = this.extractSVGFromResponse(generatedText);
      
      return svgContent;
    } catch (error) {
      console.error('Error generating bond art:', error);
      throw new Error(`Failed to generate bond art: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sube un archivo SVG a Cloud Storage
   */
  async uploadSVGToStorage(svgContent: string, filename: string): Promise<StorageUploadResult> {
    try {
      const bucket = this.storage.bucket(config.gcp.bucketName);
      const file = bucket.file(`bonds/${filename}.svg`);
      
      await file.save(svgContent, {
        metadata: {
          contentType: 'image/svg+xml',
          cacheControl: 'public, max-age=31536000', // 1 año
        },
      });

      // Hacer el archivo público
      await file.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${config.gcp.bucketName}/bonds/${filename}.svg`;
      
      return {
        url: publicUrl,
        filename: `${filename}.svg`,
        bucketName: config.gcp.bucketName,
      };
    } catch (error) {
      console.error('Error uploading SVG to storage:', error);
      throw new Error(`Failed to upload SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Procesa la evolución completa de un bond
   */
  async processBondEvolution(bondId: string): Promise<void> {
    try {
      // 1. Obtener información del bond desde Flow
      const bond = await this.flowService.getBond(bondId);
      if (!bond) {
        throw new Error(`Bond ${bondId} not found`);
      }

      // 2. Construir contexto para la IA
      const context: AIPromptContext = {
        bondLevel: bond.level,
        artSeed: bond.artSeed,
        conversationHistory: bond.conversationContext || [],
        evolutionTrigger: 'level_up'
      };

      // 3. Generar nuevo informe de misión
      const missionReport = await this.generateMissionReport(context);
      
      // 4. Generar nuevo arte SVG
      const svgContent = await this.generateBondArt(bond.artSeed, bond.level);
      
      // 5. Subir SVG a Cloud Storage
      const filename = `bond-${bondId}-level-${bond.level}-${Date.now()}`;
      const uploadResult = await this.uploadSVGToStorage(svgContent, filename);
      
      // 6. Subir el informe de misión como texto a Cloud Storage
      const reportUrl = await this.uploadTextToStorage(missionReport, `report-${filename}`);
      
      // 7. Actualizar metadatos en la blockchain
      await this.flowService.updateBondMetadata(bondId, reportUrl, uploadResult.url);
      
      console.log(`Bond ${bondId} evolution completed successfully`);
    } catch (error) {
      console.error(`Error processing bond evolution for ${bondId}:`, error);
      throw error;
    }
  }

  /**
   * Construye el prompt para generar el informe de misión
   */
  private buildMissionReportPrompt(context: AIPromptContext): string {
    const conversationSummary = context.conversationHistory
      .slice(-5) // Últimos 5 mensajes
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return `
Eres el Bibliotecario de "La Red de Autómatas", una organización clandestina que opera en las sombras de la sociedad digital.

CONTEXTO:
- Nivel del Vínculo: ${context.bondLevel}
- Semillas de Arte: ${context.artSeed.join(', ')}
- Conversación Reciente:
${conversationSummary}

MISIÓN:
Genera un "Informe de Misión" críptico y poético que documente la evolución de este Vínculo Clandestino. 

ESTILO:
- Lenguaje críptico y metafórico
- Referencias a redes, conexiones y secretos
- Tono conspirador pero esperanzador
- Entre 200-400 palabras
- Formato de informe clasificado

ESTRUCTURA:
[CLASIFICADO - NIVEL ${context.bondLevel}]
INFORME DE EVOLUCIÓN DE VÍNCULO
AGENTE: [Nombre en clave]
OPERACIÓN: [Nombre de operación]
ESTADO: [Descripción poética del progreso]
PRÓXIMOS PASOS: [Instrucciones enigmáticas]

Genera el informe completo:`;
  }

  /**
   * Construye el prompt para generar arte SVG
   */
  private buildArtPrompt(artSeed: string[], bondLevel: number): string {
    return `
Genera un código SVG completo y válido para un "Corazón Clandestino" - un símbolo artístico que representa la conexión entre dos personas en una red secreta.

ESPECIFICACIONES:
- Dimensiones: 400x400 píxeles
- Estilo: Minimalista, geométrico, con elementos orgánicos
- Paleta: Tonos oscuros con acentos brillantes (#1a1a1a, #3a3a3a, #ff6b6b, #4ecdc4)
- Nivel de complejidad: ${bondLevel} (más elementos a mayor nivel)
- Semillas creativas: ${artSeed.join(', ')}

ELEMENTOS A INCLUIR:
- Un corazón estilizado en el centro
- Patrones de red/conexiones que irradian desde el corazón
- ${bondLevel} nodos conectados alrededor del perímetro
- Efectos sutiles de brillo/luminiscencia
- Geometría fractal inspirada en las semillas: ${artSeed.join(', ')}

REQUISITOS TÉCNICOS:
- SVG válido y bien formado
- Usar elementos <path>, <circle>, <polygon>
- Incluir gradientes y efectos de filtro
- Optimizado para renderizado web
- Sin dependencias externas

Responde ÚNICAMENTE con el código SVG completo, sin explicaciones adicionales:`;
  }

  /**
   * Extrae el código SVG de la respuesta de la IA
   */
  private extractSVGFromResponse(response: string): string {
    // Buscar el contenido SVG en la respuesta
    const svgMatch = response.match(/<svg[\s\S]*?<\/svg>/i);
    
    if (svgMatch) {
      return svgMatch[0];
    }
    
    // Si no encuentra SVG completo, generar uno básico
    return this.generateFallbackSVG();
  }

  /**
   * Genera un SVG básico como fallback
   */
  private generateFallbackSVG(): string {
    return `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="heartGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:0.8" />
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="#1a1a1a"/>
  <path d="M200,300 C150,200 50,200 50,150 C50,100 100,100 150,150 C200,100 250,100 250,150 C250,200 200,250 200,300 Z" fill="url(#heartGradient)"/>
  <circle cx="200" cy="200" r="3" fill="#ff6b6b"/>
</svg>`.trim();
  }

  /**
   * Sube texto a Cloud Storage
   */
  private async uploadTextToStorage(content: string, filename: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(config.gcp.bucketName);
      const file = bucket.file(`reports/${filename}.txt`);
      
      await file.save(content, {
        metadata: {
          contentType: 'text/plain; charset=utf-8',
          cacheControl: 'public, max-age=31536000',
        },
      });

      await file.makePublic();
      
      return `https://storage.googleapis.com/${config.gcp.bucketName}/reports/${filename}.txt`;
    } catch (error) {
      console.error('Error uploading text to storage:', error);
      throw new Error(`Failed to upload text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}