const { body, validationResult } = require('express-validator');
const checkInService = require('../services/checkInService');

const createCheckIn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // For anime type, use animeTitle as title if title is not provided
    if (req.body.type === 'anime' && !req.body.title && req.body.animeTitle) {
      req.body.title = req.body.animeTitle;
    }
    
    // For music types (opening, ending, insert), title is required
    if (req.body.type !== 'anime' && !req.body.title) {
      return res.status(400).json({ 
        message: 'Title is required for music types (opening, ending, insert)' 
      });
    }

    const checkIn = await checkInService.createCheckIn(req.user._id, req.body);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      const fullCheckIn = await require('../models/CheckIn').findById(checkIn._id);
      const checkInObj = fullCheckIn.toObject ? fullCheckIn.toObject() : fullCheckIn;
      io.to(`garden-${req.user._id}`).emit('new-flower', {
        checkIn: checkInObj
      });
    }

    // Ensure animeImage is included in response
    const checkInObj = checkIn.toObject ? checkIn.toObject() : checkIn;
    res.status(201).json({
      message: 'Check-in created successfully',
      checkIn: checkInObj
    });
  } catch (error) {
    console.error('Create check-in error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getCheckIns = async (req, res) => {
  try {
    const result = await checkInService.getCheckIns(req.user._id, req.query);
    // Ensure all check-ins have animeImage field
    result.checkIns = result.checkIns.map(ci => ({
      ...ci,
      animeImage: ci.animeImage || null
    }));
    res.json(result);
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getCheckInById = async (req, res) => {
  try {
    const checkIn = await checkInService.getCheckInById(req.params.id, req.user._id);
    res.json({ checkIn });
  } catch (error) {
    console.error('Get check-in error:', error);
    res.status(error.message === 'Check-in not found' ? 404 : 500).json({ 
      message: error.message || 'Server error' 
    });
  }
};

const updateCheckIn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const checkIn = await checkInService.updateCheckIn(
      req.params.id,
      req.user._id,
      req.body
    );

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      const updatedCheckIn = await require('../models/CheckIn').findById(checkIn._id);
      io.to(`garden-${req.user._id}`).emit('flower-updated', {
        checkIn: updatedCheckIn
      });
    }

    res.json({
      message: 'Check-in updated successfully',
      checkIn
    });
  } catch (error) {
    console.error('Update check-in error:', error);
    res.status(error.message === 'Check-in not found' ? 404 : 500).json({ 
      message: error.message || 'Server error' 
    });
  }
};

const deleteCheckIn = async (req, res) => {
  try {
    await checkInService.deleteCheckIn(req.params.id, req.user._id);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`garden-${req.user._id}`).emit('flower-removed', {
        checkInId: req.params.id
      });
    }

    res.json({ message: 'Check-in deleted successfully' });
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(error.message === 'Check-in not found' ? 404 : 500).json({ 
      message: error.message || 'Server error' 
    });
  }
};

module.exports = {
  createCheckIn,
  getCheckIns,
  getCheckInById,
  updateCheckIn,
  deleteCheckIn
};

