'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ps extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Ps.belongsTo(models.User, {foreignKey: 'parent_id'});
        Ps.belongsTo(models.User, {foreignKey: 'student_id'});

    }
  }
  Ps.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'users',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
        references:{
        model:'users',
        key: 'id'
      }
    }
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Ps',
    tableName: 'parent_student',
    timestamps: true,
    createdAt: false,
    updatedAt: false
}
  );

  return Ps;
};