'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subject.hasMany(models.Cs, {foreignKey: 'subject_id'})
    }
  }
  Subject.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull:false,
    }
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Subject',
    tableName: 'subjects',
    timestamps: true,
    createdAt: false,
    updatedAt: false
}
  );

  return Subject;
};