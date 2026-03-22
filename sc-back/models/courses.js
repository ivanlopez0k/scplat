'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.hasMany(models.Cs, { foreignKey: 'course_id' });
      Course.hasMany(models.Enrollment, { foreignKey: 'course_id'});
    }
  }
  Course.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Course',
    tableName: 'courses',
    timestamps: true,
    createdAt: false,
    updatedAt: false
}
  );

  return Course;
};