import { useQuestContext } from '../../state/QuestContext';

export default function QuestProgress() {
  const {
    activeQuest,
    getMonsterName,
    getMaterialName,
    simulateMonsterKill,
  } = useQuestContext();

  if (!activeQuest) {
    return (
      <div className="quest-progress bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-400 mb-2">📜 Quest Progress</h3>
        <p className="text-sm text-gray-500">No active quest. Visit the Quest Master to accept a quest.</p>
      </div>
    );
  }

  const { quest, progress, isComplete } = activeQuest;
  const progressPercent = Math.min((progress / quest.targetAmount) * 100, 100);

  const getObjectiveText = () => {
    const monsterName = getMonsterName(quest.targetMonster);
    if (quest.type === 'slay') {
      return `Slay ${quest.targetAmount} ${monsterName}`;
    } else if (quest.targetMaterial) {
      const materialName = getMaterialName(quest.targetMaterial);
      return `Collect ${quest.targetAmount} ${materialName}`;
    }
    return `Complete objective: ${quest.targetAmount}`;
  };

  // Demo button to simulate killing monsters
  const handleSimulateKill = () => {
    simulateMonsterKill(quest.targetMonster);
  };

  return (
    <div className={`quest-progress bg-gray-800/50 border rounded-lg p-4 ${
      isComplete ? 'border-green-500/50' : 'border-amber-500/30'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-amber-400">📜 {quest.title}</h3>
        {isComplete && (
          <span className="text-green-400 text-sm font-semibold">✓ Complete!</span>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-3">{getObjectiveText()}</p>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Progress</span>
          <span className={isComplete ? 'text-green-400' : 'text-amber-400'}>
            {progress} / {quest.targetAmount}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isComplete ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Rewards Preview */}
      <div className="flex items-center gap-3 mt-3 text-xs">
        <span className="text-gray-500">Rewards:</span>
        <span className="text-yellow-400">💰 {quest.rewards.gold}</span>
        <span className="text-blue-400">⭐ {quest.rewards.exp} XP</span>
        {quest.rewards.item && (
          <span className="text-purple-400">🎁 {quest.rewards.item}</span>
        )}
      </div>

      {/* Demo: Simulate Kill Button */}
      {!isComplete && (
        <button
          onClick={handleSimulateKill}
          className="mt-3 w-full px-3 py-1.5 bg-red-600/80 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          🗡️ Simulate Kill ({getMonsterName(quest.targetMonster)})
        </button>
      )}

      {isComplete && (
        <p className="mt-3 text-sm text-green-400 text-center">
          Return to the Quest Master to claim your rewards!
        </p>
      )}
    </div>
  );
}
