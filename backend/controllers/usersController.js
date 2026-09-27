function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl };
}

export const getMe = (req, res) => res.json({ user: publicUser(req.user) });

export const updateMe = async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ user: publicUser(req.user) });
};
