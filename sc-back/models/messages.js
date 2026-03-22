'use strict';
const {
  Model, DataTypes
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Message.belongsTo(models.User, { foreignKey: 'sender', as: 'Sender' });
      Message.belongsTo(models.User, { foreignKey: 'receiver', as: 'Receiver' });

    }
  }
  Message.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    sender: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: 'users',
        key: 'id'
      }
    },
      receiver: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_read: {
      type: DataTypes.BOOLEAN
    }
  }, 
  {    
    sequelize: sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
}
  );

  return Message;
};