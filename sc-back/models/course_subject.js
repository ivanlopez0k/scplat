'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        Cs.belongsTo(models.Course, {foreignKey: 'course_id'});
        Cs.belongsTo(models.Subject, {foreignKey: 'subject_id'});
        Cs.hasMany(models.Exam, { foreignKey: 'cs_id' });
        Cs.hasMany(models.Tc, { foreignKey: 'cs_id' });
    }
  }
  Cs.init({
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
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
        references:{
        model:'subjects',
        key: 'id'
      }
    }
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Cs',
    tableName: 'course_subject',
    timestamps: true,
    createdAt: false,
    updatedAt: false
}
  );

  return Cs;
};