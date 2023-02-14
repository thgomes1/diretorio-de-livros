const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  user: { type: String, required: true },
  password: { type: String, required: true },
});

export default module = mongoose.model('User', userSchema);
