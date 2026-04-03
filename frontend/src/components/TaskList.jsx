import QuestCard from "./QuestCard.jsx";

const TaskList = ({ quests = [], onComplete, completingQuestId = "", celebratingQuestId = "" }) => {
  if (!quests.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {quests.map((quest) => (
        <QuestCard
          key={quest._id}
          quest={quest}
          onComplete={onComplete}
          isCompleting={completingQuestId === quest._id}
          isCelebrating={celebratingQuestId === quest._id}
        />
      ))}
    </div>
  );
};

export default TaskList;
