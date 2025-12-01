import { useState } from 'react';
import { GameMenu } from '../ui';
import { useQuestContext } from '../../state/QuestContext';
import { QUEST_TYPE } from '../../state/gameStateSlice';

export default function QuestMaster() {
  const [isOpen, setIsOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showRewardMessage, setShowRewardMessage] = useState<string | null>(null);

  const {
    activeQuest,
    availableQuest,
    character,
    acceptQuest,
    completeQuest,
    getMonsterName,
    getMaterialName,
  } = useQuestContext();

  const handleAcceptQuest = () => {
    if (availableQuest) {
      acceptQuest(availableQuest);
    }
  };

  const handleCompleteQuest = () => {
    const result = completeQuest();
    if (result) {
      const { rewards } = result;
      let message = `Quest Complete! Rewards: ${rewards.gold} Gold, ${rewards.exp} EXP`;
      if (rewards.item) {
        message += `, Item: ${rewards.item}`;
      }
      setShowRewardMessage(message);
      setTimeout(() => setShowRewardMessage(null), 3000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleInfo = () => {
    setShowInfo(!showInfo);
  };

  const getQuestDescription = (quest: typeof availableQuest) => {
    if (!quest) return '';
    const monsterName = getMonsterName(quest.targetMonster);
    if (quest.type === QUEST_TYPE.SLAY) {
      return `Slay ${quest.targetAmount} ${monsterName}`;
    } else if (quest.targetMaterial) {
      const materialName = getMaterialName(quest.targetMaterial);
      return `Collect ${quest.targetAmount} ${materialName} from ${monsterName}`;
    }
    return `Complete objective: ${quest.targetAmount}`;
  };

  return (
    <div className="quest-master">
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="mb-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
        >
          Visit Quest Master
        </button>
      )}

      <GameMenu
        title="Quest Master"
        isOpen={isOpen}
        onClose={handleClose}
        onInfo={handleInfo}
        width={340}
      >
        {showInfo && (
          <div className="game-menu-row bg-amber-900/30 p-2 mb-2 rounded text-xs">
            <span className="text-amber-300">
              💡 The Quest Master offers quests based on your level. Complete quests for rewards!
            </span>
          </div>
        )}

        {showRewardMessage && (
          <div className="game-menu-row bg-green-900/40 p-2 mb-2 rounded text-xs animate-pulse">
            <span className="text-green-300">✨ {showRewardMessage}</span>
          </div>
        )}

        {/* Player Info Section */}
        <div className="game-menu-section-title">Adventurer Status</div>
        <div className="game-menu-row">
          <span className="game-menu-label">Name</span>
          <span className="game-menu-value">{character.name}</span>
        </div>
        <div className="game-menu-row">
          <span className="game-menu-label">Level</span>
          <span className="game-menu-value-highlight">{character.level}</span>
        </div>
        <div className="game-menu-row">
          <span className="game-menu-label">Gold</span>
          <span className="game-menu-value text-yellow-400">{character.gold}</span>
        </div>

        <div className="game-menu-divider"></div>

        {/* Active Quest Section */}
        {activeQuest ? (
          <>
            <div className="game-menu-section-title">Current Quest</div>
            <div className="game-menu-row flex-col items-start gap-1">
              <span className="game-menu-value text-amber-400 font-semibold">
                {activeQuest.quest.title}
              </span>
              <span className="text-xs text-gray-400">
                {activeQuest.quest.description}
              </span>
            </div>
            <div className="game-menu-row">
              <span className="game-menu-label">Objective</span>
              <span className="game-menu-value text-xs">
                {getQuestDescription(activeQuest.quest)}
              </span>
            </div>
            <div className="game-menu-row">
              <span className="game-menu-label">Progress</span>
              <span className={`game-menu-value ${activeQuest.isComplete ? 'text-green-400' : ''}`}>
                {activeQuest.progress} / {activeQuest.quest.targetAmount}
                {activeQuest.isComplete && ' ✓'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 mb-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeQuest.isComplete ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      (activeQuest.progress / activeQuest.quest.targetAmount) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Rewards Preview */}
            <div className="game-menu-row">
              <span className="game-menu-label">Rewards</span>
              <span className="game-menu-value text-xs">
                <span className="text-yellow-400">{activeQuest.quest.rewards.gold}g</span>
                {' | '}
                <span className="text-blue-400">{activeQuest.quest.rewards.exp} exp</span>
                {activeQuest.quest.rewards.item && (
                  <>
                    {' | '}
                    <span className="text-purple-400">{activeQuest.quest.rewards.item}</span>
                  </>
                )}
              </span>
            </div>

            {/* Complete Button */}
            {activeQuest.isComplete && (
              <button
                onClick={handleCompleteQuest}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold"
              >
                Complete Quest
              </button>
            )}
          </>
        ) : availableQuest ? (
          <>
            <div className="game-menu-section-title">Available Quest</div>
            <div className="game-menu-row flex-col items-start gap-1">
              <span className="game-menu-value text-amber-400 font-semibold">
                {availableQuest.title}
              </span>
              <span className="text-xs text-gray-400">
                {availableQuest.description}
              </span>
            </div>
            <div className="game-menu-row">
              <span className="game-menu-label">Level Required</span>
              <span className="game-menu-value-highlight">{availableQuest.level}</span>
            </div>
            <div className="game-menu-row">
              <span className="game-menu-label">Objective</span>
              <span className="game-menu-value text-xs">
                {getQuestDescription(availableQuest)}
              </span>
            </div>
            <div className="game-menu-row">
              <span className="game-menu-label">Rewards</span>
              <span className="game-menu-value text-xs">
                <span className="text-yellow-400">{availableQuest.rewards.gold}g</span>
                {' | '}
                <span className="text-blue-400">{availableQuest.rewards.exp} exp</span>
                {availableQuest.rewards.item && (
                  <>
                    {' | '}
                    <span className="text-purple-400">{availableQuest.rewards.item}</span>
                  </>
                )}
              </span>
            </div>
            <button
              onClick={handleAcceptQuest}
              className="mt-3 w-full px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-semibold"
            >
              Accept Quest
            </button>
          </>
        ) : (
          <>
            <div className="game-menu-section-title">No Quests Available</div>
            <div className="game-menu-row">
              <span className="text-gray-400 text-sm">
                Level up to unlock more quests, adventurer!
              </span>
            </div>
          </>
        )}
      </GameMenu>
    </div>
  );
}
