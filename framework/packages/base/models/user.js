module.exports = function(sequelize, DataTypes) {
  return sequelize.define("User", {
    username: DataTypes.STRING,
    password_hash: DataTypes.STRING, 
  })
}