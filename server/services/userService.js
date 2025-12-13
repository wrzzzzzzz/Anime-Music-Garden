const User = require('../models/User');
const CheckIn = require('../models/CheckIn');

const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'garden.flowers',
      select: 'title type rating emotion date flowerSize position',
      options: { sort: { date: -1 }, limit: 100 }
    })
    .select('-password');

  // Calculate additional stats
  const totalCheckIns = await CheckIn.countDocuments({ user: userId });
  const checkInsByType = await CheckIn.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const averageRating = await CheckIn.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const stats = {
    totalCheckIns,
    checkInsByType: checkInsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    averageRating: averageRating[0]?.avgRating?.toFixed(2) || 0
  };

  return { user, stats };
};

const updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

module.exports = {
  getProfile,
  updateProfile
};

