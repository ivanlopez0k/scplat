'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: 'student_id', as: 'student' });
      Notification.belongsTo(models.Exam, { foreignKey: 'exam_id', as: 'exam' });
    }
  }
  Notification.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'exams',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('grade_update'),
      allowNull: false,
    },
    subject_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    course_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  },
  {
    sequelize: sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Notification;
};
