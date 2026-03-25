export { GrudgeNetworkService, grudgeNetwork } from './GrudgeNetworkService.js'
export { UserChatSystem, chatSystem } from './UserChatSystem.js'
export { LeaderboardService, leaderboardService } from './LeaderboardService.js'
export { FriendSystem, friendSystem } from './FriendSystem.js'

import { grudgeNetwork } from './GrudgeNetworkService.js'
import { chatSystem } from './UserChatSystem.js'
import { friendSystem } from './FriendSystem.js'

export async function initializeGrudgeNetwork() {
    console.log('[GrudgeNetwork] Initializing Grudge Studio Network...')
    
    const connected = await grudgeNetwork.initialize()
    
    if (connected) {
        await chatSystem.initialize()
        
        if (grudgeNetwork.currentUser) {
            await friendSystem.initialize()
        }
        
        grudgeNetwork.on('userChanged', async (user) => {
            if (user) {
                await friendSystem.initialize()
            } else {
                friendSystem.destroy()
            }
        })
    }
    
    console.log('[GrudgeNetwork] Initialization complete')
    return connected
}

export default {
    grudgeNetwork,
    chatSystem,
    friendSystem,
    initializeGrudgeNetwork
}
