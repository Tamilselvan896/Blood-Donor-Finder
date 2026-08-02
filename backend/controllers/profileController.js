// GET /api/profile (protected)
exports.getProfile = async (req, res) => {
  const user = req.user;
  res.json({
    id: user._id,
    name: user.name,
    fullName: user.name,
    email: user.email,
    bloodGroup: user.bloodGroup,
    age: user.age,
    gender: user.gender,
    phone: user.phone,
    city: user.city,
    state: user.state,
    address: user.address,
    userType: user.userType,
  });
};
