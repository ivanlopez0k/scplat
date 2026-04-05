'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Grade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Grade.belongsTo(models.User, { foreignKey: 'student_id' });
        Grade.belongsTo(models.Exam, { foreignKey: 'exam_id' });
    }
  }
  Grade.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'users',
        key: 'id'
      }
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'exams',
        key: 'id'
      }
    },
    note: {
      type: DataTypes.DECIMAL(3,1),
      allowNull: false,
      validate: {
        min: 0,
        max: 10
      }
    }
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Grade',
    tableName: 'grades',
    timestamps: true,
    createdAt: false,
    updatedAt: false
}
  );

  return Grade;
};