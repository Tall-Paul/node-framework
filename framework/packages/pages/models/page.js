module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Page", {
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    path: DataTypes.STRING,    
  })
}
