'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Ps, {foreignKey: 'parent_id'});
      User.hasMany(models.Ps, {foreignKey: 'student_id'});
      User.hasMany(models.Message, {foreignKey: 'sender', as: 'SentMessages'});
      User.hasMany(models.Message, {foreignKey: 'receiver', as: 'ReceivedMessages'});
      User.hasMany(models.Grade, {foreignKey: 'student_id'});
      User.hasMany(models.Exam, { foreignKey: 'teacher_id'});
      User.hasMany(models.Enrollment, { foreignKey: 'student_id' });
      User.hasMany(models.Tc, { foreignKey: 'teacher_id', as: 'teacher_courses'});
    }
  }
  User.init({
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
    lastname: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    dni:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull:false
    },
    role: {
      type: DataTypes.ENUM('student','teacher','parent','admin'),
      allowNull:false,
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
    },
  },
  {
    sequelize: sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
}
  );

  return User;
};