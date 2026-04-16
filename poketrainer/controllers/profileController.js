const { User, TeamPokemon } = require('../models');
const path = require('path');
const fs = require('fs');

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id, {
      include: [{ model: TeamPokemon, as: 'team', order: [['slot', 'ASC']] }]
    });

    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    const team = user.team
      .sort((a, b) => a.slot - b.slot)
      .map(p => ({
        ...p.toJSON(),
        types: JSON.parse(p.types || '[]'),
        displayName: p.nickname || p.name
      }));

    res.render('profile/index', {
      title: `${user.username}'s Profile`,
      profileUser: user,
      team
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load profile.');
    res.redirect('/');
  }
};

// GET /profile/:username (public view)
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      include: [{ model: TeamPokemon, as: 'team' }]
    });

    if (!user) {
      return res.status(404).render('error', { title: 'Trainer Not Found', message: 'That trainer does not exist.' });
    }

    const team = user.team
      .sort((a, b) => a.slot - b.slot)
      .map(p => ({
        ...p.toJSON(),
        types: JSON.parse(p.types || '[]'),
        displayName: p.nickname || p.name
      }));

    res.render('profile/public', {
      title: `${user.username}'s Trainer Card`,
      profileUser: user,
      team,
      isOwner: req.session.user && req.session.user.id === user.id
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// GET /profile/edit
exports.getEditProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id);
    res.render('profile/edit', { title: 'Edit Profile', profileUser: user });
  } catch (err) {
    req.flash('error', 'Could not load edit form.');
    res.redirect('/profile');
  }
};

// POST /profile/edit
exports.postEditProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id);
    const { trainerTitle, bio, hometown, badges } = req.body;

    user.trainerTitle = trainerTitle || user.trainerTitle;
    user.bio = bio || '';
    user.hometown = hometown || '';
    user.badges = Math.min(8, Math.max(0, parseInt(badges) || 0));

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if it exists and isn't the default
      if (user.avatar) {
        const oldPath = path.join(__dirname, '..', 'public', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.avatar = '/uploads/' + req.file.filename;
    }

    await user.save();
    req.flash('success', 'Profile updated!');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update profile.');
    res.redirect('/profile/edit');
  }
};
