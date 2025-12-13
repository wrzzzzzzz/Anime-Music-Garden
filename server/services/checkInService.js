const CheckIn = require('../models/CheckIn');
const User = require('../models/User');

// Helper function to calculate flower size based on rating
const getFlowerSize = (rating) => {
  return 0.5 + (rating / 10) * 1.5;
};

const createCheckIn = async (userId, checkInData) => {
  const { type, title, animeTitle, animeId, animeImage, episode, rating, emotion, notes, date } = checkInData;

  const flowerSize = getFlowerSize(rating);

  const checkIn = new CheckIn({
    user: userId,
    type,
    title,
    animeTitle,
    animeId,
    animeImage: (animeImage && animeImage.trim() !== '') ? animeImage.trim() : undefined,
    episode,
    rating,
    emotion,
    notes,
    date: date ? new Date(date) : new Date(),
    flowerSize
  });

  await checkIn.save();

  // Update user's garden
  const user = await User.findById(userId);
  user.garden.flowers.push(checkIn._id);
  user.garden.totalCheckIns += 1;
  await user.save();

  // Reload checkIn to ensure all fields are included
  const savedCheckIn = await CheckIn.findById(checkIn._id);
  
  return savedCheckIn;
};

const getCheckIns = async (userId, query = {}) => {
  const { type, limit = 50, skip = 0 } = query;
  const filter = { user: userId };
  
  if (type) {
    filter.type = type;
  }

  const checkIns = await CheckIn.find(filter)
    .select('+animeImage') // Explicitly include animeImage
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await CheckIn.countDocuments(filter);

  // Ensure animeImage is included in response
  const checkInsWithImages = checkIns.map(ci => ci.toObject());
  
  return { checkIns: checkInsWithImages, total, limit: parseInt(limit), skip: parseInt(skip) };
};

const getCheckInById = async (checkInId, userId) => {
  const checkIn = await CheckIn.findOne({
    _id: checkInId,
    user: userId
  });

  if (!checkIn) {
    throw new Error('Check-in not found');
  }

  return checkIn;
};

const updateCheckIn = async (checkInId, userId, updateData) => {
  const checkIn = await CheckIn.findOne({
    _id: checkInId,
    user: userId
  });

  if (!checkIn) {
    throw new Error('Check-in not found');
  }

  // Recalculate flower size if rating changed
  if (updateData.rating) {
    const rating = updateData.rating || checkIn.rating;
    updateData.flowerSize = getFlowerSize(rating);
  }

  Object.assign(checkIn, updateData);
  await checkIn.save();

  return checkIn;
};

const deleteCheckIn = async (checkInId, userId) => {
  const checkIn = await CheckIn.findOne({
    _id: checkInId,
    user: userId
  });

  if (!checkIn) {
    throw new Error('Check-in not found');
  }

  // Remove from user's garden
  const user = await User.findById(userId);
  user.garden.flowers = user.garden.flowers.filter(
    flowerId => flowerId.toString() !== checkIn._id.toString()
  );
  user.garden.totalCheckIns = Math.max(0, user.garden.totalCheckIns - 1);
  await user.save();

  await CheckIn.findByIdAndDelete(checkInId);

  return checkIn;
};

module.exports = {
  createCheckIn,
  getCheckIns,
  getCheckInById,
  updateCheckIn,
  deleteCheckIn,
  getFlowerSize
};

