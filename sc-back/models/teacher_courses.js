'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Tc.belongsTo(models.User, {foreignKey: 'teacher_id'});
        Tc.belongsTo(models.Cs, {foreignKey: 'cs_id'});
    }
  }
  Tc.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'users',
        key: 'id'
      }
    },
    cs_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
        references:{
        model:'course_subject',
        key: 'id'
      }
    }
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Tc',
    tableName: 'teacher_courses',
    timestamps: true,
    createdAt: false,
    updatedAt: false
}
  );

  return Tc;
};