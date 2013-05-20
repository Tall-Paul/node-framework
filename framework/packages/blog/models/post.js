module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Post", {
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    author: DataTypes.STRING,
    slug: DataTypes.STRING,
    category: DataTypes.INTEGER,
  })
}