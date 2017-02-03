from sqlalchemy.orm import relationship
from model import db
from sqlalchemy import Table, Column, Integer, ForeignKey
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method

# Prep for Class automapping
# engine = create_engine('mysql://%s:%s@%s/%s'%(USER, PASSWORD, HOSTNAME, DATABASE)) # connect to server
# db_session = scoped_session(sessionmaker(autocommit=False,
#                                      autoflush=False,
#                                      bind=engine))
# metadata = MetaData()
# metadata.reflect(engine, only=['cdg_user', 'cdg_order', 'lab_region', 'lab_area', 'lab_complex', 'lab_branch', 'lab_user_info'])
# Base = automap_base(metadata=metadata)
# Base.query = db_session.query_property()
APPROVED = 'approved'
DM_APPROVAL = 'District Manager'
BM_APPROVAL = 'Branch Manager'
MM_APPROVAL = 'Media Manager'
ADMIN_NAME = 'Admin'
SITE_ADMIN = 'Site Administrator'

class Division(db.Model):
    __tablename__ = 'lab_region'

class District(db.Model):
    __tablename__ = 'lab_area'
    division = relationship('Division', foreign_keys='District.fk_region_id', primaryjoin='Division.pk_id == District.fk_region_id', backref='districts')

class Complex(db.Model):
    __tablename__ = 'lab_complex'
    district = relationship('District', foreign_keys='Complex.fk_area_id', primaryjoin='District.pk_id == Complex.fk_area_id', backref='complexes')

class Branch(db.Model):
    __tablename__ = 'lab_branch'
    orders = relationship('Order', foreign_keys='Order.fk_branch_id', primaryjoin='Branch.pk_id == Order.fk_branch_id', backref='branch')
    complex = relationship('Complex', foreign_keys='Branch.fk_complex_id', primaryjoin='Complex.pk_id == Branch.fk_complex_id', backref='branches')
    userInfos = relationship('UserInfo', foreign_keys='UserInfo.fk_branch_id', primaryjoin='UserInfo.fk_branch_id == Branch.pk_id', backref='branch')
    managers = relationship('UserInfo', secondary='user_info_to_branch', backref='managerBranches')

class User(db.Model):
    __tablename__ = 'cdg_user'
    orders = relationship('Order', foreign_keys='Order.fk_creator_id', primaryjoin='User.pk_id == Order.fk_creator_id', backref='creator')
    userInfo = relationship('UserInfo', foreign_keys='UserInfo.pk_id', primaryjoin='User.pk_id == UserInfo.pk_id', backref='user', uselist=False)

class UserInfo(db.Model):
    __tablename__ = 'lab_user_info'
    db.Table('lab_user_info', db.Model.metadata,
        db.Column('fk_branch_id', Integer, ForeignKey(Branch.pk_id)),
        extend_existing=True,
    )
    @hybrid_property
    def nameFull(self):
        return ' '.join([self.name_last, self.name_first])
    @hybrid_property
    def branchManager(self):
        if len(self.branch.managers) > 0: return self.branch.managers[0]
        return None

class UserInfoBranchJoin(db.Model):
    __tablename__ = 'user_info_to_branch'
    db.Table('user_info_to_branch', db.Model.metadata,
        db.Column('cpkfk_branch_id', Integer, ForeignKey(Branch.pk_id), primary_key=True),
        db.Column('cpkfk_user_info_id', Integer, ForeignKey(UserInfo.pk_id), primary_key=True),
        extend_existing=True,
    )

class Order(db.Model):
    __tablename__ = 'cdg_order'
    db.Table('cdg_order', db.Model.metadata,
        db.Column('fk_creator_id', Integer, ForeignKey(User.pk_id)),
        db.Column('fk_branch_id', Integer, ForeignKey(Branch.pk_id)),
        extend_existing=True,
    )
    approvalDetails = relationship('ApprovalDetail', foreign_keys='ApprovalDetail.fk_order_id', primaryjoin='ApprovalDetail.fk_order_id == Order.pk_id', backref='order')
    @hybrid_property
    def dateApprovedBM(self):
        for detail in self.approvalDetails:
        	if (detail.status_description == APPROVED and (detail.user_role == BM_APPROVAL or detail.user_role == MM_APPROVAL or detail.user_role == SITE_ADMIN) ):
        		return self.date_created

    @hybrid_property
    def approvedBM(self):
        for detail in self.approvalDetails:
        	if (detail.status_description == APPROVED and (detail.user_role == BM_APPROVAL or detail.user_role == MM_APPROVAL) ):
        		return detail.user_name
        	elif (detail.status_description == APPROVED and detail.user_role == SITE_ADMIN ):
        		return ADMIN
    @hybrid_property
    def approvedDM(self):
        for detail in self.approvalDetails:
            if detail.status_description == APPROVED and detail.user_role == SITE_ADMIN:
                return detail.user_name
    @hybrid_property
    def dateApprovedDM(self):
        for detail in self.approvalDetails:
            if detail.status_description == APPROVED and detail.user_role == SITE_ADMIN:
                return self.date_created

class OrderStatus(db.Model):
    __tablename__ = 'cdg_order_status'
    orders = relationship('Order', foreign_keys='Order.fk_order_status_id', primaryjoin='OrderStatus.pk_id == Order.fk_order_status_id', backref='status')

class Headline(db.Model):
    __tablename__ = 'lab_headline'
    template = relationship('Template', foreign_keys='Template.fk_headline', primaryjoin='Headline.pk_id == Template.fk_headline', backref='headline')
    @hybrid_property
    def codeColorTitle(self):
        return ' : '.join([self.code, self.headlineColorType.type, self.title])

class Template(db.Model):
    __tablename__ = 'cdg_template'
    orders = relationship('Order', foreign_keys='Order.fk_template_id', primaryjoin='Template.pk_id == Order.fk_template_id', backref='template')

class ApprovalDetail(db.Model):
    __tablename__ = 'approval_detail'
    db.Table('approval_detail', db.Model.metadata,
        db.Column('fk_order_id', Integer, ForeignKey('Order.pk_id')),
        extend_existing=True,
    )

class HeadlineColorType(db.Model):
    __tablename__ = 'headlinecolortype'
    headline = relationship('Headline', foreign_keys='Headline.headlineColorTypeID', primaryjoin='HeadlineColorType.pkID == Headline.headlineColorTypeID', backref='headlineColorType')

class AdditionalRunDate(db.Model):
    __tablename__ = 'additional_run_date'
    db.Table('additional_run_date', db.Model.metadata,
        db.Column('pk_id', Integer, primary_key=True),
        extend_existing=True,
    )
    order = relationship('Order', foreign_keys='Order.pk_id', primaryjoin='AdditionalRunDate.fk_order_id == Order.pk_id', backref='addtionalRunDates')
