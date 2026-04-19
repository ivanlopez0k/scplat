'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Announcement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Announcement.belongsTo(models.User, { foreignKey: 'teacher_id', as: 'teacher' });
      Announcement.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    }
  }
  Announcement.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: null
    }
  },
  {
    sequelize: sequelize,
    modelName: 'Announcement',
    tableName: 'announcements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Announcement;
};
