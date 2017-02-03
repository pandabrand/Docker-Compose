from flask import Flask
from flask_sqlalchemy import SQLAlchemy
# 	from script import Manager

# Database Configurations
app = Flask(__name__)
DATABASE = 'newtest'
PASSWORD = 'p@ssw0rd123'
USER = 'root'
HOSTNAME = 'flaskmysql_db_1'


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://%s:%s@%s/%s'%(USER, PASSWORD, HOSTNAME, DATABASE)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
db.init_app(app)
db.reflect(app = app)
