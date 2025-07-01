// get_bond_details.cdc
//
// This script reads the public data of a specific "Vínculo" (Bond)
// by calling a view function on the ClandestineNetwork contract.

import "ClandestineNetwork"

access(all) fun main(bondID: UInt64): {String: AnyStruct}? {
    
    // Call the public `borrowVínculo` function on the contract to get a reference
    // to the Vínculo resource stored in the central BondVault.
    let bondRef = ClandestineNetwork.borrowVínculo(id: bondID)

    if bondRef == nil {
        return nil
    }

    let bond = bondRef!

    // Build the result object with the Vínculo's data.
    let result = {
        "id": bond.id,
        "owners": bond.owners,
        "emisarioIDs": bond.emisarioIDs,
        "messagesExchanged": bond.messagesExchanged,
        "bondLevel": bond.bondLevel,
        "bondPoints": bond.bondPoints,
        "status": bond.status,
        "artSeed": bond.artSeed,
        "colorPaletteSeed": bond.colorPaletteSeed,
        "patternComplexitySeed": bond.patternComplexitySeed,
        "codexURI": bond.codexURI
    }

    return result
} 