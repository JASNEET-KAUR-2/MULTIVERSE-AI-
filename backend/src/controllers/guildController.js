import Guild from "../models/Guild.js";
import User from "../models/User.js";
import { ensureLength } from "../utils/validation.js";

const getNextWeeklyReset = () => {
  const now = new Date();
  const reset = new Date(now);
  const daysUntilMonday = (8 - (now.getDay() || 7)) % 7 || 7;
  reset.setDate(now.getDate() + daysUntilMonday);
  reset.setHours(0, 0, 0, 0);
  return reset;
};

export const listGuilds = async (req, res, next) => {
  try {
    const guilds = await Guild.find().sort({ createdAt: -1 }).populate("members", "name mlPrediction xp activityLog");
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const allUsers = await User.find().select("name xp streak mlPrediction activityLog guilds");
    const topPlayers = await User.find()
      .select("name xp streak mlPrediction activityLog")
      .sort({ xp: -1, streak: -1, updatedAt: -1 })
      .limit(5);

    const weeklyPlayerLeaderboard = allUsers
      .map((user) => ({
        _id: user._id,
        name: user.name,
        streak: user.streak || 0,
        weeklyXp: (user.activityLog || [])
          .filter((entry) => new Date(entry.createdAt) >= weekAgo)
          .reduce((sum, entry) => sum + (entry.xpAwarded || 0), 0)
      }))
      .sort((a, b) => b.weeklyXp - a.weeklyXp || b.streak - a.streak)
      .slice(0, 5);

    const guildLeaderboard = guilds
      .map((guild) => ({
        _id: guild._id,
        name: guild.name,
        focus: guild.focus,
        memberCount: guild.members.length,
        totalXp: guild.members.reduce((sum, member) => sum + (member.xp || 0), 0)
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, 5);

    const weeklyGuildLeaderboard = guilds
      .map((guild) => ({
        _id: guild._id,
        name: guild.name,
        focus: guild.focus,
        memberCount: guild.members.length,
        weeklyXp: guild.members.reduce((sum, member) => {
          const memberWeeklyXp = (member.activityLog || [])
            .filter((entry) => new Date(entry.createdAt) >= weekAgo)
            .reduce((innerSum, entry) => innerSum + (entry.xpAwarded || 0), 0);
          return sum + memberWeeklyXp;
        }, 0)
      }))
      .sort((a, b) => b.weeklyXp - a.weeklyXp)
      .slice(0, 5);

    const challengeCards = guildLeaderboard.slice(0, 3).map((guild, index, list) => {
      const challenger = list[index + 1];
      return {
        id: `${guild._id}-challenge`,
        title: challenger ? `${guild.name} vs ${challenger.name}` : `${guild.name} weekly push`,
        description: challenger
          ? `Race for the next 150 XP and prove which guild compounds momentum faster this week.`
          : `Defend the top position by keeping your guild active through daily logins and completed quests.`,
        reward: challenger ? "Winning guild earns social bragging rights" : "Keep the crown for another week",
        focus: guild.focus
      };
    });

    const allTimeRanks = [...allUsers]
      .sort((a, b) => b.xp - a.xp || b.streak - a.streak)
      .map((user, index) => ({
        userId: String(user._id),
        rank: index + 1,
        xp: user.xp || 0,
        streak: user.streak || 0
      }));

    const weeklyRanks = allUsers
      .map((user) => ({
        userId: String(user._id),
        weeklyXp: (user.activityLog || [])
          .filter((entry) => new Date(entry.createdAt) >= weekAgo)
          .reduce((sum, entry) => sum + (entry.xpAwarded || 0), 0),
        streak: user.streak || 0
      }))
      .sort((a, b) => b.weeklyXp - a.weeklyXp || b.streak - a.streak)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    const currentUserId = String(req.user._id);
    const personalRank = {
      allTime: allTimeRanks.find((entry) => entry.userId === currentUserId) || null,
      weekly: weeklyRanks.find((entry) => entry.userId === currentUserId) || null
    };

    const spotlight = {
      weeklyChampion: weeklyGuildLeaderboard[0] || null,
      allTimeChampion: guildLeaderboard[0] || null,
      resetAt: getNextWeeklyReset().toISOString()
    };

    res.json({
      guilds,
      topPlayers,
      guildLeaderboard,
      weeklyPlayerLeaderboard,
      weeklyGuildLeaderboard,
      challengeCards,
      personalRank,
      spotlight
    });
  } catch (error) {
    next(error);
  }
};

export const createGuild = async (req, res, next) => {
  try {
    const { name, description, focus } = req.body;
    const normalizedName = ensureLength(name, "Guild name", { min: 3, max: 40 });
    const normalizedFocus = ensureLength(focus, "Guild focus", { min: 2, max: 40 });
    const normalizedDescription = ensureLength(description, "Guild description", { min: 12, max: 220 });

    const existing = await Guild.findOne({ name: normalizedName });
    if (existing) {
      const error = new Error("A guild with that name already exists.");
      error.status = 400;
      throw error;
    }

    const guild = await Guild.create({
      name: normalizedName,
      description: normalizedDescription,
      focus: normalizedFocus,
      members: [req.user._id]
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { guilds: guild._id }
    });

    res.status(201).json({ guild });
  } catch (error) {
    next(error);
  }
};

export const joinGuild = async (req, res, next) => {
  try {
    const guildExists = await Guild.findById(req.params.guildId);
    if (!guildExists) {
      const error = new Error("Guild not found.");
      error.status = 404;
      throw error;
    }

    const guild = await Guild.findByIdAndUpdate(
      req.params.guildId,
      { $addToSet: { members: req.user._id } },
      { new: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { guilds: guild._id }
    });

    res.json({ guild });
  } catch (error) {
    next(error);
  }
};
