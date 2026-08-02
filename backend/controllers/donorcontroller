const Donor = require("../models/donor");

// GET /api/donors?bloodGroup=&city=&state=
exports.getDonors = async (req, res) => {
  try {
    const { bloodGroup, city, state } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, "i");
    if (state) filter.state = new RegExp(state, "i");

    const donors = await Donor.find(filter).sort({ createdAt: -1 });

    res.json({
      donors,
      bloodRequests: 0, // placeholder until a BloodRequest model is added
      recentActivities: [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch donors." });
  }
};

// POST /api/donors  (BecomeDonor form)
exports.createDonor = async (req, res) => {
  try {
    const { name, bloodGroup, age, gender, phone, city, state, address, availability } = req.body;

    if (!name || !bloodGroup || !age || !gender || !phone || !city || !state || !address) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const donor = await Donor.create({
      user: req.user ? req.user._id : undefined,
      name,
      bloodGroup,
      age,
      gender,
      phone,
      city,
      state,
      address,
      availability: availability !== undefined ? availability : true,
    });

    res.status(201).json(donor);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to register as donor." });
  }
};
exports.deleteDonor = async (req, res) => {
  try {
    await Donor.findOneAndDelete({ user: req.user._id });

    res.json({
      message: "Donor removed successfully."
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};
