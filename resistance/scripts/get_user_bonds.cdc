// get_user_bonds.cdc
//
// This script reads all the "ClaimTicket" NFTs from a user's collection
// and, for each ticket, fetches the details of the Vinculo it represents.

import ClandestineNetworkV2 from 0x2444e6b4d9327f09
import NonFungibleToken from 0x631e88ae7f1d7c20

access(all) fun main(userAddress: Address): [{String: AnyStruct}] {
    let result: [{String: AnyStruct}] = []
    let account = getAccount(userAddress)
    
    if let collectionRef = account.capabilities.get<&{NonFungibleToken.Collection}>(/public/ClandestineClaimCollectionV2).borrow() {
        let claimTicketIDs = collectionRef.getIDs()

        // Iterate through each ClaimTicket ID in the user's collection.
        for id in claimTicketIDs {
            // Borrow the NFT to get its details, specifically the bondID.
            let claimTicket = collectionRef.borrowNFT(id) as! &ClandestineNetworkV2.ClaimTicket

            // Use the bondID from the ticket to fetch the actual Vinculo details.
            let bondDetails = ClandestineNetworkV2.borrowVinculo(id: claimTicket.bondID)

            if let bond = bondDetails {
                let bondInfo = {
                    "bondID": bond.id,
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
    }

    return result
} 