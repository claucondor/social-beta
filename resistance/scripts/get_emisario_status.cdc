// get_emisario_status.cdc
//
// This script reads the public details of an Emisario resource
// from a user's account.

import "ClandestineNetwork"

access(all) fun main(userAddress: Address): {String: AnyStruct}? {
    // Get a reference to the public account object.
    let account = getAccount(userAddress)

    // Borrow a reference to the Emisario resource from storage.
    // Note: This only works if the user is querying their own account or has
    // exposed a public capability, which we decided against for privacy.
    // For now, this script is intended for a user to query themselves.
    let emisarioRef = account.storage.borrow<&ClandestineNetwork.Emisario>(from: ClandestineNetwork.EmisarioStoragePath)
        ?? nil // Return nil if the Emisario resource doesn't exist

    if emisarioRef == nil {
        return nil
    }

    let emisario = emisarioRef!

    // Create a dictionary of the skills for easier parsing on the frontend.
    let skills: {String: UInt8} = {}
    for key in emisario.skills.keys {
        skills[key] = emisario.skills[key]
    }

    // Build the result object with the Emisario's public data.
    let result = {
        "id": emisario.id,
        "level": emisario.level,
        "xp": emisario.xp,
        "skillPoints": emisario.skillPoints,
        "skills": skills
    }

    return result
} 