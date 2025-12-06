import { QuestMaster, QuestProgress } from '../components/game';
import { Shop } from '../components/ui';
import { useGameState } from '../state/GameStateContext';

export default function Town() {
  const { gameState, purchasePotion } = useGameState();
  const playerGold = gameState.character?.gold ?? 0;
  const playerLevel = gameState.character?.level ?? 1;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-amber-400 mb-4">Town Hub</h1>
      <p className="text-gray-300 mb-6">
        Welcome to the town! Here you can manage your inventory, visit merchants,
        and prepare for your next adventure.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shop Section */}
        <div>
          <Shop playerGold={playerGold} playerLevel={playerLevel} onPurchase={purchasePotion} />
        </div>

        {/* Quest Progress Section */}
        <div>
          <QuestProgress />
        </div>

        {/* Quest Master NPC */}
        <div>
          <QuestMaster />
        </div>
      </div>
    </div>
  );
}
