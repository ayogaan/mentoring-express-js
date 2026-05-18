'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: "id_category",
        as: 'category'
      })

      Product.belongsToMany(models.Tag, { 
        through: models.ProductTag,
        foreignKey: 'productId',
        otherKey: 'tagId',
        as: 'tags'
      });

    }
  }
  Product.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    id_category: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};