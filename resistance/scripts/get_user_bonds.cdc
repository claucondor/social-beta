// get_user_bonds.cdc
//
// This script reads all the "ClaimTicket" NFTs from a user's collection
// and, for each ticket, fetches the details of the Vinculo it represents.

import "NonFungibleToken"
import "ClandestineNetwork"

access(all) fun main(userAddress: Address): [{String: AnyStruct}] {
    
    let result: [{String: AnyStruct}] = []
    
    // Get the public capability for the user's ClaimTicket Collection.
    let collectionCap = getAccount(userAddress).capabilities.get<&{NonFungibleToken.Collection}>(ClandestineNetwork.ClaimCollectionPublicPath)

    if !collectionCap.check() {
        // If the capability doesn't exist or is invalid, return an empty array.
        return result
    }

    let collection = collectionCap.borrow()!
    let claimTicketIDs = collection.getIDs()

    // Iterate through each ClaimTicket ID in the user's collection.
    for id in claimTicketIDs {
        // Borrow the NFT to get its details, specifically the bondID.
        let claimTicket = collection.borrowNFT(id: id) as! &ClandestineNetwork.ClaimTicket

        // Use the bondID from the ticket to fetch the actual Vinculo details.
        let bondDetails = ClandestineNetwork.borrowVinculo(id: claimTicket.bondID)

        if let bond = bondDetails {
            // If the bond exists, add its details to our result array.
            let bondInfo = {
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
            result.append(bondInfo)
        }
    }

    return result
} 