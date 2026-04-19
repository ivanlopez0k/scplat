'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Exam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Exam.belongsTo(models.Cs, { foreignKey: 'cs_id', as: 'Cs'});
        Exam.belongsTo(models.User, { foreignKey: 'teacher_id'});
        Exam.hasMany(models.Grade, { foreignKey: 'exam_id'})
    }
  }
  Exam.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    cs_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'course_subject',
        key: 'id'
      }
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    exam_number:{
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
      type: DataTypes.ENUM('EXAMEN','TP','RECUPERATORIO'),
      allowNull:false,
    },
    exam_date: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Exam',
    tableName: 'exams',
    timestamps: true,
    createdAt: false,
    updatedAt: false
}
  );

  return Exam;
};