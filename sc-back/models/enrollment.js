'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Enrollment.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
      Enrollment.belongsTo(models.User, { foreignKey: 'student_id', as: 'student' });
    }
  }
  Enrollment.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'courses',
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
    },
    school_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Enrollment',
    tableName: 'enrollment',
    timestamps: true,
    createdAt: false,
    updatedAt: false
}
  );

  return Enrollment;
};