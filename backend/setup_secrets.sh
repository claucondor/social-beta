#!/bin/bash
# Script para crear secretos en Google Cloud Secret Manager de forma segura.
set -e

# --- CONFIGURACIÓN ---
# El único valor que es realmente un secreto.
SECRET_NAME="FLOW_ORACLE_PRIVATE_KEY"
SECRET_VALUE="0x17ad999a5fc220357ac62320eb59702e6878fb365cb62b200cc33008329766d5"
GCP_PROJECT_ID="automatic-ace-457219-r3"
# --- FIN DE LA CONFIGURACIÓN ---

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Configurando secretos para el proyecto ${GCP_PROJECT_ID}...${NC}"

# 1. Habilitar la API de Secret Manager
echo "🔧 Habilitando la API de Secret Manager (si no está habilitada)..."
gcloud services enable secretmanager.googleapis.com --project=${GCP_PROJECT_ID}

# 2. Crear el secreto si no existe
echo "🔐 Verificando si el secreto '${SECRET_NAME}' existe..."
if gcloud secrets describe ${SECRET_NAME} --project=${GCP_PROJECT_ID} &>/dev/null; then
    echo -e "${YELLOW}El secreto '${SECRET_NAME}' ya existe. No se realizarán cambios en el valor.${NC}"
else
    echo "El secreto no existe. Creándolo ahora..."
    echo -n "${SECRET_VALUE}" | gcloud secrets create ${SECRET_NAME} \
        --project=${GCP_PROJECT_ID} \
        --replication-policy="automatic" \
        --data-file=-
    echo -e "${GREEN}✅ Secreto '${SECRET_NAME}' creado exitosamente.${NC}"
fi

# 3. Dar permisos a Cloud Build para acceder al secreto
echo "🔑 Otorgando permisos a la cuenta de servicio de Cloud Build..."
PROJECT_NUMBER=$(gcloud projects describe ${GCP_PROJECT_ID} --format='value(projectNumber)')
GCP_SA="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud secrets add-iam-policy-binding ${SECRET_NAME} \
    --project=${GCP_PROJECT_ID} \
    --member="${GCP_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None >/dev/null # Silenciamos la salida para no mostrar información sensible

echo -e "${GREEN}✅ Permiso otorgado a Cloud Build para acceder a '${SECRET_NAME}'.${NC}"
echo -e "${GREEN}🎉 ¡Proceso completado! Tu secreto está seguro en Secret Manager.${NC}" 