drop database if exists`bhima`;
create database `bhima`;
use `bhima`;

-- grant all privileges on *.* to 'bhima'@'%' identified by 'HISCongo2013' with grant option;
grant all privileges on *.* to 'bhima'@'localhost' identified by 'HISCongo2013' with grant option;
flush privileges;

drop table if exists `language`;
create table `language` (
  `id`        tinyint unsigned not null,
  `name`      text not null,
  `key`       text not null,
  primary key (`id`)
);

drop table if exists `currency`;
create table `currency` (
  `id`                  tinyint unsigned not null auto_increment,
  `name`                text not null,
  `symbol`              varchar(15) not null,
  `note`                text,
  `separator`           varchar(5),
  `decimal`             varchar(5),
  `min_monentary_unit`  decimal(10, 2) not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `exchange_rate`;
create table `exchange_rate` (
  `id`                      mediumint unsigned not null auto_increment,
  `enterprise_currency_id`  tinyint unsigned not null,
  `foreign_currency_id`     tinyint unsigned not null,
  `rate`                    decimal(19, 4) unsigned not null,
  `date`                    date not null,
  key `enterprise_currency_id` (`enterprise_currency_id`),
  key `foreign_currency_id` (`foreign_currency_id`),
  primary key (`id`),
  constraint foreign key (`enterprise_currency_id`) references `currency` (`id`),
  constraint foreign key (`foreign_currency_id`) references `currency` (`id`)
) engine=innodb;

drop table if exists `user`;
create table `user` (
  `id`        smallint unsigned not null auto_increment,
  `username`  varchar(80) not null,
  `password`  varchar(100) not null,
  `first`     text not null,
  `last`      text not null,
  `email`     varchar(100),
  `logged_in` boolean not null default 0,
  `pin`       char(4) not null default 0,
  primary key (`id`)
) engine=innodb;

drop table if exists `unit`;
create table `unit` (
  `id`            smallint unsigned not null,
  `name`          varchar(30) not null,
  `key`           varchar(70) not null,
  `description`   text not null,
  `parent`        smallint default 0,
  `has_children`  boolean not null default 0,
  `url`           tinytext,
  `path`          tinytext,
  primary key (`id`)
) engine=innodb;


drop table if exists `permission`;
create table `permission` (
  `id`        mediumint unsigned not null auto_increment,
  `unit_id`   smallint unsigned not null,
  `user_id`   smallint unsigned not null,
  primary key (`id`),
  key `unit_id` (`unit_id`),
  key `user_id` (`user_id`),
  constraint unique key (`unit_id`, `user_id`),
  constraint foreign key (`unit_id`) references `unit` (`id`) on delete cascade on update cascade,
  constraint foreign key (`user_id`) references `user` (`id`) on delete cascade on update cascade
) engine=innodb;


drop table if exists `country`;
create table `country` (
  `uuid`        char(36) not null,
  `code`        smallint unsigned not null,
  `country_en`  varchar(45) not null,
  `country_fr`  varchar(45) not null,
  primary key (`uuid`),
  unique key `code_unique` (`code`)
) engine=innodb;

drop table if exists `province`;
create table `province` (
  `uuid`       char(36) not null,
  `name`       text,
  `country_uuid` char(36) not null,
  primary key (`uuid`),
  key `country_uuid` (`country_uuid`),
  constraint foreign key (`country_uuid`) references `country` (`uuid`)
) engine=innodb;

drop table if exists `sector`;
create table `sector` (
  `uuid`        char(36) not null,
  `name`        text,
  `province_uuid` char(36) not null,
  primary key (`uuid`),
  key `province_id` (`province_uuid`),
  constraint foreign key (`province_uuid`) references `province` (`uuid`)
) engine=innodb;

drop table if exists `village`;
create table `village` (
  `uuid`        char(36) not null,
  `name`        text,
  `sector_uuid` char(36) not null,
  primary key (`uuid`),
  key `sector_id` (`sector_uuid`),
  constraint foreign key (`sector_uuid`) references `sector` (`uuid`)
) engine=innodb;

drop table if exists `enterprise`;
create table `enterprise` (
  `id`                  smallint unsigned not null auto_increment,
  `name`                text not null,
  `abbr`                varchar(50),
  `phone`               varchar(20),
  `email`               varchar(70),
  `location_id`         char(36),
  `logo`                varchar(70),
  `currency_id`         tinyint unsigned not null,
  primary key (`id`),
  key `location_id` (`location_id`),
  key `currency_id` (`currency_id`),
  constraint foreign key (`currency_id`) references `currency` (`id`),
  constraint foreign key (`location_id`) references `village` (`uuid`)
) engine=innodb;

drop table if exists `project`;
create table `project` (
  `id`              smallint unsigned not null auto_increment,
  `name`            text,
  `abbr`            char(3) UNIQUE,
  `enterprise_id`   smallint unsigned not null,
  primary key (`id`),
  key `enterprise_id` (`enterprise_id`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`)
) engine=innodb;

drop table if exists `project_permission`;
create table `project_permission` (
  `id`            smallint unsigned not null auto_increment,
  `user_id`       smallint unsigned not null,
  `project_id`    smallint unsigned not null,
  primary key (`id`),
  key `user_id` (`user_id`),
  key `project_id` (`project_id`),
  constraint unique key (`user_id`, `project_id`),
  constraint foreign key (`project_id`) references `project` (`id`)
) engine=innodb;

drop table if exists `budget`;
create table `budget` (
  `id` int not null auto_increment,
  `account_id` int unsigned not null default '0',
  `period_id` mediumint unsigned not null,
  `budget` decimal(10,4) unsigned,
  primary key (`id`)
) engine=innodb;

drop table if exists `critere`;
create table `critere` (
  `id`            smallint unsigned not null auto_increment,
  `text`          varchar(50) not null,
  `note`          text,
  primary key (`id`)
) engine=innodb;

drop table if exists `account_type`;
create table `account_type` (
  `id` mediumint unsigned not null,
  `type` varchar(35) not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `cost_center`;
create table `cost_center` (
  `project_id`      smallint unsigned not null,
  `id`              smallint not null auto_increment,
  `text`            varchar(100) not null,
  `note`            text,
  `is_principal`    boolean default 0,
  primary key (`id`),
  key `project_id` (`project_id`),
  constraint foreign key (`project_id`) references `project` (`id`) on delete cascade
) engine=innodb;


drop table if exists `profit_center`;
create table `profit_center` (
  `project_id`      smallint unsigned not null,
  `id`              smallint not null auto_increment,
  `text`            varchar(100) not null,
  `note`            text,
  primary key (`id`),
  key `project_id` (`project_id`),
  constraint foreign key (`project_id`) references `project` (`id`) on delete cascade
) engine=innodb;


drop table if exists `cost_center_assignation`;
create table `cost_center_assignation` (
  `project_id`      smallint unsigned not null,
  `id`              int unsigned not null auto_increment,
  `auxi_cc_id`      smallint not null,
  `cost`      float default 0,
  `date`            date,
  `note`            text,
  primary key (`id`),
  key `project_id` (`project_id`),
  key `auxi_cc_id` (`auxi_cc_id`),
  constraint foreign key (`project_id`) references `project` (`id`) on delete cascade,
  constraint foreign key (`auxi_cc_id`) references `cost_center` (`id`) on delete cascade
) engine=innodb;


drop table if exists `cost_center_assignation_item`;
create table `cost_center_assignation_item` (
  `cost_center_assignation_id`      int unsigned not null,
  `id`                              int unsigned not null auto_increment,
  `pri_cc_id`                       smallint not null,
  `init_cost`                       float default 0,
  `value_criteria`                  float default 1,
  primary key (`id`),
  key `cost_center_assignation_id` (`cost_center_assignation_id`),
  key `pri_cc_id` (`pri_cc_id`),
  constraint foreign key (`cost_center_assignation_id`) references `cost_center_assignation` (`id`) on delete cascade,
  constraint foreign key (`pri_cc_id`) references `cost_center` (`id`) on delete cascade
) engine=innodb;

drop table if exists `account`;
create table `account` (
  `id`                  int unsigned not null auto_increment,
  `account_type_id`     mediumint unsigned not null,
  `enterprise_id`       smallint unsigned not null,
  `account_number`      int not null,
  `account_txt`         text,
  `parent`              int unsigned not null,
  `fixed`               boolean default 0,
  `locked`              tinyint unsigned default 0,
  `cc_id`               smallint null,
  `pc_id`               smallint null,
  `created`             timestamp null default CURRENT_TIMESTAMP,
  `classe`              int null,
  primary key (`id`),
  key `account_type_id` (`account_type_id`),
  key `enterprise_id` (`enterprise_id`),
  key `cc_id`         (`cc_id`),
  -- key `pc_id`         (`pc_id`),
  constraint foreign key (`account_type_id`) references `account_type` (`id`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`),
  constraint foreign key (`cc_id`)         references `cost_center` (`id`)
  -- constraint foreign key (`pc_id`)         references `profit_center` (`id`)
) engine=innodb;

drop table if exists `creditor_group`;
create table `creditor_group` (
  `enterprise_id` smallint unsigned not null,
  `uuid`          char(36) not null,
  `name`          varchar(80),
  `account_id`    int unsigned not null,
  `locked`        boolean not null default 0,
  primary key (`uuid`),
  key `account_id` (`account_id`),
  key `enterprise_id` (`enterprise_id`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`) on delete cascade on update cascade,
  constraint foreign key (`account_id`) references `account` (`id`) on delete cascade on update cascade
) engine=innodb;

drop table if exists `creditor`;
create table `creditor` (
  `uuid`        char(36) not null,
  `group_uuid`  char(36) not null,
  `text`        varchar(45),
  primary key (`uuid`),
  key `group_uuid` (`group_uuid`),
  constraint foreign key (`group_uuid`) references `creditor_group` (`uuid`) on delete cascade on update cascade
) engine=innodb;


drop table if exists `payment`;
create table `payment` (
  `id`      tinyint unsigned not null auto_increment,
  `days`    smallint unsigned default '0',
  `months`  mediumint unsigned default '0',
  `text`    varchar(50) not null,
  `note`    text,
  primary key (`id`)
) engine=innodb;

drop table if exists `cash_box`;
create table `cash_box` (
  `id`              mediumint unsigned not null auto_increment,
  `text`            text not null,
  `project_id`      smallint unsigned not null,
  `is_auxillary`    boolean not null,
  primary key (`id`),
  key `project_id` (`project_id`),
  constraint foreign key (`project_id`) references `project` (`id`)
) engine=innodb;

drop table if exists `cash_box_account_currency`;
create table `cash_box_account_currency` (
  `id`              mediumint unsigned not null auto_increment,
  `currency_id`     tinyint unsigned not null,
  `cash_box_id`     mediumint unsigned not null,
  `account_id`      int unsigned,
  primary key (`id`),
  key `currency_id` (`currency_id`),
  key `cash_box_id` (`cash_box_id`),
  key `account_id` (`account_id`),
  constraint foreign key (`currency_id`) references `currency` (`id`),
  constraint foreign key (`cash_box_id`) references `cash_box` (`id`),
  constraint foreign key (`account_id`) references `account` (`id`)
) engine=innodb;

drop table if exists `caution_box`;
create table `caution_box` (
  `id`              mediumint unsigned not null auto_increment,
  `text`            text not null,
  `project_id`      smallint unsigned not null,
  primary key (`id`),
  key `project_id` (`project_id`),
  constraint foreign key (`project_id`) references `project` (`id`)
) engine=innodb;

drop table if exists `caution_box_account_currency`;
create table `caution_box_account_currency` (
  `id`              mediumint unsigned not null auto_increment,
  `currency_id`     tinyint unsigned not null,
  `caution_box_id`     mediumint unsigned not null,
  `account_id`    int unsigned,
  primary key (`id`),
  key `currency_id` (`currency_id`),
  key `caution_box_id` (`caution_box_id`),
  key `account_id` (`account_id`),
  constraint foreign key (`currency_id`) references `currency` (`id`),
  constraint foreign key (`caution_box_id`) references `caution_box` (`id`),
  constraint foreign key (`account_id`) references `account` (`id`)
) engine=innodb;

drop table if exists `fiscal_year`;
create table `fiscal_year` (
  `enterprise_id`             smallint unsigned not null,
  `id`                        mediumint unsigned not null auto_increment,
  `number_of_months`          mediumint unsigned not null,
  `fiscal_year_txt`           text not null,
  `transaction_start_number`  int unsigned,
  `transaction_stop_number`   int unsigned,
  `fiscal_year_number`        mediumint unsigned,
  `start_month`               int unsigned not null,
  `start_year`                int unsigned not null,
  `previous_fiscal_year`      mediumint unsigned,
  `closing_account`           int unsigned null,
  `locked`                    boolean not null default 0,
  primary key (`id`),
  key `enterprise_id` (`enterprise_id`),
  constraint foreign key (`closing_account`) references `account` (`id`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`)
) engine=innodb;


drop table if exists `period`;
create table `period` (
  `id`              mediumint unsigned not null auto_increment,
  `fiscal_year_id`  mediumint unsigned not null,
  `period_number`   smallint unsigned not null,
  `period_start`    date not null,
  `period_stop`     date not null,
  `locked`          boolean not null default 0,
  primary key (`id`),
  key `fiscal_year_id` (`fiscal_year_id`),
  constraint foreign key (`fiscal_year_id`) references `fiscal_year` (`id`)
) engine=innodb;

drop table if exists `inventory_unit`;
create table `inventory_unit` (
  `id`    smallint unsigned not null auto_increment,
  `text`  varchar(100) not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `inventory_type`;
create table `inventory_type` (
  `id`    tinyint unsigned not null auto_increment,
  `text`  varchar(150) not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `inventory_group`;
create table `inventory_group` (
  `uuid`            char(36) not null,
  `name`            varchar(100) not null,
  `code`            smallint not null,
  `sales_account`   mediumint unsigned not null,
  `cogs_account`    mediumint unsigned,
  `stock_account`   mediumint unsigned,
  `donation_account`     mediumint unsigned,
  primary key (`uuid`),
  key `sales_account` (`sales_account`),
  key `cogs_account` (`cogs_account`),
  key `stock_account` (`stock_account`),
  key `donation_account` (`donation_account`)
  -- constraint foreign key (`sales_account`) references `account` (`account_number`),
  -- constraint foreign key (`cogs_account`) references `account` (`account_number`),
  -- constraint foreign key (`stock_account`) references `account` (`account_number`),
  -- constraint foreign key (`tax_account`) references `account` (`account_number`)
) engine=innodb;

drop table if exists `inventory`;
create table `inventory` (
  `enterprise_id`   smallint unsigned not null,
  `uuid`            char(36) not null,
  `code`            varchar(30) not null,
  `text`            text,
  `price`           decimal(10,4) unsigned not null default '0.00',
  `purchase_price`  decimal(10,4) unsigned not null default '0.00',
  `group_uuid`      char(36) not null,
  `unit_id`         smallint unsigned,
  `unit_weight`     mediumint default '0',
  `unit_volume`     mediumint default '0',
  `stock`           int unsigned not null default '0',
  `stock_max`       int unsigned not null default '0',
  `stock_min`       int unsigned not null default '0',
  `type_id`         tinyint unsigned not null default '0',
  `consumable`      boolean not null default 0,
  `origin_stamp`    timestamp null default CURRENT_TIMESTAMP,
  primary key (`uuid`),
  unique key `code` (`code`),
  key `enterprise_id` (`enterprise_id`),
  key `group_uuid` (`group_uuid`),
  key `unit_id` (`unit_id`),
  key `type_id` (`type_id`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`),
  constraint foreign key (`group_uuid`) references `inventory_group` (`uuid`),
  constraint foreign key (`unit_id`) references `inventory_unit` (`id`),
  constraint foreign key (`type_id`) references `inventory_type` (`id`)
) engine=innodb;

drop table if exists `price_list`;
create table `price_list` (
  enterprise_id   smallint unsigned not null,
  uuid            char(36) not null,
  title           text,
  description     text,
  primary key (`uuid`),
  key `enterprise_id` (`enterprise_id`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`)
) engine=innodb;

drop table if exists `price_list_item`;
create table `price_list_item` (
  `uuid`            char(36) not null,
  `item_order`      int unsigned not null,
  `description`     text,
  `value`           float not null,
  `is_discount`     boolean not null default 0,
  `is_global`       boolean not null default 0, -- TODO names should better describe values
  `price_list_uuid` char(36) not null,
  `inventory_uuid`  char(36),
  primary key (`uuid`),
  -- unique index (`item_order`, `price_list_uuid`),
  key `price_list_uuid` (`price_list_uuid`),
  key `inventory_uuid` (`inventory_uuid`),
  constraint foreign key (`price_list_uuid`) references `price_list` (`uuid`) on delete cascade,
  constraint foreign key (`inventory_uuid`) references `inventory` (`uuid`) on delete cascade
) engine=innodb;

drop table if exists `service`;
create table `service` (
  `id`                smallint unsigned not null auto_increment,
  `project_id`        smallint unsigned not null,
  `name`              text not null,
  `cost_center_id`    smallint  null,
  `profit_center_id`  smallint  null,
  primary key (`id`),
  key `project_id` (`project_id`),
  key `cost_center_id` (`cost_center_id`),
  key `profit_center_id` (`profit_center_id`),
  constraint foreign key (`project_id`) references `project` (`id`) on update cascade,
  constraint foreign key (`cost_center_id`) references `cost_center` (`id`) on update cascade,
  constraint foreign key (`profit_center_id`) references `profit_center` (`id`) on update cascade
) engine=innodb;

drop table if exists `debitor_group`;
create table `debitor_group` (
  `enterprise_id`       smallint unsigned not null,
  `uuid`                char(36) not null,
  `name`                varchar(100) not null,
  `account_id`          int unsigned not null,
  `location_id`         char(36) not null,
  `payment_id`          tinyint unsigned not null default '3',
  `phone`               varchar(10) default '',
  `email`               varchar(30) default '',
  `note`                text,
  `locked`              boolean not null default 0,
  `tax_id`              smallint unsigned null,
  `max_credit`          mediumint unsigned default '0',
  `is_convention`        boolean not null default 0,
  `price_list_uuid`      char(36) null,
  primary key (`uuid`),
  key `enterprise_id` (`enterprise_id`),
  key `account_id` (`account_id`),
  key `location_id` (`location_id`),
  key `price_list_uuid` (`price_list_uuid`),
--  key `tax_id` (`tax_id`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`) on delete cascade on update cascade,
  constraint foreign key (`account_id`) references `account` (`id`) on delete cascade on update cascade,
  constraint foreign key (`location_id`) references `village` (`uuid`) on delete cascade on update cascade,
  constraint foreign key (`price_list_uuid`) references `price_list` (`uuid`) on delete cascade on update cascade
--  constraint foreign key (`tax_id`) references `tax` (`id`),
) engine=innodb;

drop table if exists `patient_group`;
create table `patient_group` (
  enterprise_id     smallint unsigned not null,
  uuid              char(36) not null,
  price_list_uuid   char(36) not null,
  name              varchar(60) not null,
  note              text,
  created           timestamp null default CURRENT_TIMESTAMP,
  primary key (`uuid`),
  key `enterprise_id` (`enterprise_id`),
  key `price_list_uuid` (`price_list_uuid`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`),
  constraint foreign key (`price_list_uuid`) references `price_list` (`uuid`)
) engine=innodb;

drop table if exists `debitor`;
create table `debitor` (
  `uuid`          char(36) not null,
  `group_uuid`    char(36) not null,
  `text`      text,
  primary key (`uuid`),
  key `group_uuid` (`group_uuid`),
  constraint foreign key (`group_uuid`) references `debitor_group` (`uuid`) on delete cascade
) engine=innodb;

drop table if exists `supplier`;
create table `supplier` (
  `uuid`            char(36),
  `creditor_uuid`   char(36) not null,
  `name`            varchar(45) not null,
  `address_1`       text,
  `address_2`       text,
  `location_id`     char(36) not null,
  `email`           varchar(45),
  `fax`             varchar(45),
  `note`            varchar(50),
  `phone`           varchar(15),
  `international`   boolean not null default 0,
  `locked`          boolean not null default 0,
  primary key (`uuid`),
  key `creditor_uuid` (`creditor_uuid`),
  key `location_id` (`location_id`),
  constraint foreign key (`location_id`) references `village` (`uuid`) on delete cascade on update cascade,
  constraint foreign key (`creditor_uuid`) references `creditor` (`uuid`) on delete cascade on update cascade
) engine=innodb;

drop table if exists `patient`;
create table `patient` (
  `uuid`              char(36) not null,
  `project_id`        smallint unsigned not null,
  `reference`         int unsigned not null,
  `debitor_uuid`      char(36) not null,
  `creditor_uuid`     char(36) null,
  `first_name`        varchar(150) not null,
  `last_name`         varchar(150) not null,
  `dob`               date,
  `title`             varchar(30),
  `father_name`       varchar(150),
  `mother_name`       varchar(150),
  `profession`        varchar(150),
  `employer`          varchar(150),
  `spouse`            varchar(150),
  `spouse_profession` varchar(150),
  `spouse_employer`   varchar(150),
  `sex`               char(1) not null,
  `religion`          varchar(50),
  `marital_status`    varchar(50),
  `phone`             varchar(12),
  `email`             varchar(40),
  `address_1`         varchar(100),
  `address_2`         varchar(100),
  `renewal`           boolean not null default 0,
  `origin_location_id`        char(36) not null,
  `current_location_id`       char(36) not null,
  `registration_date`         timestamp null default CURRENT_TIMESTAMP,
  primary key (`uuid`),
  key `reference` (`reference`),
  key `project_id` (`project_id`),
  key `debitor_uuid` (`debitor_uuid`),
  key `origin_location_id` (`origin_location_id`),
  key `current_location_id` (`current_location_id`),
  unique key `creditor_uuid` (`creditor_uuid`),
  constraint foreign key (`project_id`) references `project` (`id`),
  constraint foreign key (`debitor_uuid`) references `debitor` (`uuid`) on update cascade on delete cascade,
  constraint foreign key (`current_location_id`) references `village` (`uuid`) on update cascade,
  constraint foreign key (`origin_location_id`) references `village` (`uuid`) on update cascade
) engine=innodb;

-- create trigger `patient_reference`
--   before insert on `patient`
--   for each row
--   set new.reference = (select IF(ISNULL(max(reference)), 1, max(reference) + 1) from patient where project_id = new.project_id);

drop table if exists `patient_visit`;
create table `patient_visit` (
  `uuid`                  char(36) not null,
  `patient_uuid`          char(36) not null,
  `date`                  timestamp not null,
  `registered_by`         smallint unsigned not null,
  primary key (`uuid`),
  key `patient_uuid` (`patient_uuid`),
  key `registered_by` (`registered_by`),
  constraint foreign key (`patient_uuid`) references `patient` (`uuid`) on delete cascade on update cascade,
  constraint foreign key (`registered_by`) references `user` (`id`) on delete cascade on update cascade
) engine=innodb;

drop table if exists `assignation_patient`;
create table `assignation_patient` (
  `uuid`                char(36) not null,
  `patient_group_uuid`  char(36) not null,
  `patient_uuid`        char(36) not null,
  primary key (`uuid`),
  key `patient_group_uuid` (`patient_group_uuid`),
  key `patient_uuid` (`patient_uuid`),
  constraint foreign key (`patient_group_uuid`) references `patient_group` (`uuid`) on delete cascade on update cascade,
  constraint foreign key (`patient_uuid`) references `patient` (`uuid`) on delete cascade on update cascade
) engine=innodb;

drop table if exists `sale`;
create table `sale` (
  `project_id`    smallint unsigned not null,
  `reference`     int unsigned not null,
  `uuid`          char(36) not null,
  `cost`          decimal(19,4) unsigned not null,
  `currency_id`   tinyint unsigned not null,
  `debitor_uuid`  char(36),
  `service_id`    smallint unsigned null,
  `seller_id`     smallint unsigned not null default 0,
  `discount`      mediumint unsigned default '0',
  `invoice_date`  date not null,
  `note`          text,
  `posted`        boolean not null default '0',
  `timestamp`     timestamp default current_timestamp,
  primary key (`uuid`),
  key `reference` (`reference`),
  key `project_id` (`project_id`),
  key `debitor_uuid` (`debitor_uuid`),
  key `currency_id` (`currency_id`),
  key `service_id`  (`service_id`),
  constraint foreign key (`project_id`) references `project` (`id`),
  constraint foreign key (`debitor_uuid`) references `debitor` (`uuid`),
  constraint foreign key (`currency_id`) references `currency` (`id`),
  constraint foreign key (`service_id`) references `service` (`id`)
) engine=innodb;


drop table if exists `credit_note`;
create table `credit_note` (
  `project_id`    smallint unsigned not null,
  `reference`     int unsigned not null,
  `uuid`          char(36) not null,
  `cost`          decimal(19,4) unsigned not null,
  `debitor_uuid`  char(36) not null,
  `seller_id`     smallint unsigned not null default 0,
  `sale_uuid`     char(36) not null,
  `note_date`     date not null,
  `description`   text,
  `posted`        boolean not null default 0,
  primary key (`uuid`),
  key `reference` (`reference`),
  key `project_id` (`project_id`),
  key `debitor_uuid` (`debitor_uuid`),
  key `sale_uuid` (`sale_uuid`),
  constraint foreign key (`project_id`) references `project` (`id`),
  constraint foreign key (`debitor_uuid`) references `debitor` (`uuid`),
  constraint foreign key (`sale_uuid`) references `sale` (`uuid`)
) engine=innodb;

drop table if exists `sale_item`;
create table `sale_item` (
  `sale_uuid`         char(36) not null,
  `uuid`              char(36) not null,
  `inventory_uuid`    char(36) not null,
  `quantity`          int unsigned default '0',
  `inventory_price`   decimal(19,4),
  `transaction_price` decimal(19,4) not null,
  `debit`             decimal(19,4) not null default 0,
  `credit`            decimal(19,4) not null default 0,
  -- `unit_price`    decimal(19, 2) unsigned not null,
  -- `total`         decimal(19, 2) unsigned,
  primary key (`uuid`),
  key `sale_uuid` (`sale_uuid`),
  key `inventory_uuid` (`inventory_uuid`),
  constraint foreign key (`sale_uuid`) references `sale` (`uuid`) on delete cascade,
  constraint foreign key (`inventory_uuid`) references `inventory` (`uuid`)
) engine=innodb;

drop table if exists `depot`;
create table `depot` (
  `uuid`               char(36) not null,
  `reference`          int unsigned not null auto_increment,
  `text`               text,
  `enterprise_id`      smallint unsigned not null,
  `is_warehouse`       smallint unsigned not null default 0,
  primary key (`uuid`),
  key `reference` (`reference`)
) engine=innodb;

drop table if exists `consumption`;
create table `consumption` (
  `uuid`             char(36) not null,
  `depot_uuid`       char(36) not null,
  `date`             date,
  `document_id`      char(36) not null,
  `tracking_number`  char(50) not null,
  `quantity`           int unsigned,
  primary key (`uuid`),
  key `depot_uuid`   (`depot_uuid`),
  constraint foreign key (`depot_uuid`) references `depot` (`uuid`) on delete cascade on update cascade
) engine=innodb;

drop table if exists `consumption_patient`;
create table `consumption_patient` (
  `uuid`                char(36) not null,
  `consumption_uuid`    char(36) not null,
  `sale_uuid`           char(36) not null,
  `patient_uuid`        char(36) not null,
  primary key (`uuid`),
  key `consumption_uuid` (`consumption_uuid`),
  key `sale_uuid` (`sale_uuid`),
  key `patient_uuid` (`patient_uuid`),
  constraint foreign key (`consumption_uuid`) references `consumption` (`uuid`),
  constraint foreign key (`sale_uuid`) references `sale` (`uuid`),
  constraint foreign key (`patient_uuid`) references `patient` (`uuid`)
) engine=innodb;

drop table if exists `consumption_service`;
create table `consumption_service` (
  `uuid`                char(36) not null,
  `consumption_uuid`    char(36) not null,
  `service_id`          smallint unsigned not null,
  primary key (`uuid`),
  key `consumption_uuid` (`consumption_uuid`),
  key `service_id` (`service_id`),
  constraint foreign key (`consumption_uuid`) references `consumption` (`uuid`),
  constraint foreign key (`service_id`) references `service` (`id`)
) engine=innodb;

drop table if exists `consumption_loss`;
create table `consumption_loss` (
  `uuid`                char(36) not null,
  `consumption_uuid`    char(36) not null,
  `document_uuid`       char(36) not null,
  primary key (`uuid`)
  -- key `consumption_uuid` (`consumption_uuid`),
  -- constraint foreign key (`consumption_uuid`) references `consumption` (`uuid`)
) engine=innodb;

drop table if exists `consumption_rummage`;
create table `consumption_rummage` (
  `uuid`                char(36) not null,
  `consumption_uuid`        char(36) not null,
  `document_uuid`           char(36) not null,
  primary key (`uuid`)
  -- key `consumption_uuid` (`consumption_uuid`),
  -- constraint foreign key (`consumption_uuid`) references `consumption` (`uuid`)
) engine=innodb;

drop table if exists `consumption_reversing`;
create table `consumption_reversing` (
  `uuid`             char(36) not null,
  `consumption_uuid`        char(36) not null,  
  `depot_uuid`       char(36) not null,
  `document_id`       char(36) not null,
  `date`             date,
  `tracking_number`  char(50) not null,
  `quantity`           int,
  `description`        text,    
  primary key (`uuid`),
  key `consumption_uuid` (`consumption_uuid`),
  key `depot_uuid`   (`depot_uuid`),
  constraint foreign key (`consumption_uuid`) references `consumption` (`uuid`),
  constraint foreign key (`depot_uuid`) references `depot` (`uuid`) on delete cascade on update cascade
) engine=innodb;



drop table if exists `transaction_type`;
create table `transaction_type` (
  `id`            tinyint unsigned not null auto_increment,
  `service_txt`   varchar(45) not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `primary_cash_module`;
create table `primary_cash_module` (
  `id`            tinyint unsigned not null auto_increment,
  `text`          varchar(45) not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `cash`;
create table `cash` (
  `project_id`      smallint unsigned not null,
  `reference`       int unsigned not null,
  `uuid`            char(36) not null,
  `document_id`     int unsigned not null,
  `type`            char(1) not null,
  `date`            date not null,
  `debit_account`   int unsigned not null,
  `credit_account`  int unsigned not null,
  `deb_cred_uuid`   char(36) not null,
  `deb_cred_type`   varchar(1) not null,
  `currency_id`     tinyint unsigned not null,
  `cost`            decimal(19,4) unsigned not null default 0,
  `user_id`         smallint unsigned not null,
  `cashbox_id`      smallint unsigned not null,
  `description`     text,
  primary key (`uuid`),
  key `reference` (`reference`),
  key `project_id` (`project_id`),
  key `currency_id` (`currency_id`),
  key `user_id` (`user_id`),
  key `debit_account` (`debit_account`),
  key `credit_account` (`credit_account`),
  constraint foreign key (`project_id`) references `project` (`id`),
  constraint foreign key (`currency_id`) references `currency` (`id`),
  constraint foreign key (`user_id`) references `user` (`id`),
  constraint foreign key (`debit_account`) references `account` (`id`),
  constraint foreign key (`credit_account`) references `account` (`id`)
) engine=innodb;

drop table if exists `cash_item`;
create table `cash_item` (
  `uuid`              char(36) not null,
  `cash_uuid`         char(36) not null,
  `allocated_cost`    decimal(19,4) unsigned not null default 0.00,
  `invoice_uuid`      char(36),
  primary key (`uuid`),
  key `cash_uuid` (`cash_uuid`),
--  key `invoice_uuid` (`invoice_uuid`),
  constraint foreign key (`cash_uuid`) references `cash` (`uuid`)
--  constraint foreign key (`invoice_uuid`) references `sale` (`uuid`)
) engine=innodb;

-- TODO : number of records posted
drop table if exists `posting_session`;
create table `posting_session` (
  `id`        int unsigned not null auto_increment,
  `user_id`   smallint unsigned not null,
  `date`      timestamp not null,
  primary key (`id`),
  key `user_id` (`user_id`),
  constraint foreign key (`user_id`) references `user` (`id`)
) engine=innodb;

drop table if exists `posting_journal`;
create table `posting_journal` (
  `uuid`              char(36) not null,
  `project_id`        smallint unsigned not null,
  `fiscal_year_id`    mediumint unsigned, -- not null,
  `period_id`         mediumint unsigned, -- not null,
  `trans_id`          text not null,
  `trans_date`        date not null,
  `doc_num`           int unsigned,
  `description`       text,
  `account_id`        int unsigned not null,
  `debit`             decimal (19, 4) unsigned not null default 0,
  `credit`            decimal (19, 4) unsigned not null default 0,
  `debit_equiv`       decimal (19, 4) unsigned not null default 0,
  `credit_equiv`      decimal (19, 4) unsigned not null default 0,
  `currency_id`       tinyint unsigned not null,
  `deb_cred_uuid`     char(36),
  `deb_cred_type`     char(1),
  `inv_po_id`         char(36),
  `comment`           text,
  `cost_ctrl_id`      varchar(10),
  `origin_id`         tinyint unsigned not null,
  `user_id`           smallint unsigned not null,
  `cc_id`             smallint,
  `pc_id`             smallint,
  primary key (`uuid`),
  key `project_id` (`project_id`),
  key `fiscal_year_id` (`fiscal_year_id`),
  key `period_id` (`period_id`),
  key `origin_id` (`origin_id`),
  key `currency_id` (`currency_id`),
  key `user_id` (`user_id`),
  key `cc_id` (`cc_id`),
  key `pc_id` (`pc_id`),
  constraint foreign key (`fiscal_year_id`) references `fiscal_year` (`id`),
  constraint foreign key (`period_id`) references `period` (`id`),
  constraint foreign key (`origin_id`) references `transaction_type` (`id`) on update cascade,
  constraint foreign key (`project_id`) references `project` (`id`) on update cascade,
  constraint foreign key (`currency_id`) references `currency` (`id`) on update cascade,
  constraint foreign key (`user_id`) references `user` (`id`) on update cascade,
  constraint foreign key (`cc_id`) references `cost_center` (`id`) on update cascade,
  constraint foreign key (`pc_id`) references `profit_center` (`id`) on update cascade
) engine=innodb;

drop table if exists `general_ledger`;
create table `general_ledger` (
  `uuid`              char(36) not null,
  `project_id`        smallint unsigned not null,
  `fiscal_year_id`    mediumint unsigned not null,
  `period_id`         mediumint unsigned not null,
  `trans_id`          text not null,
  `trans_date`        date not null,
  `doc_num`           int unsigned,
  `description`       text,
  `account_id`        int unsigned not null,
  `debit`             decimal(19, 4) unsigned not null default 0,
  `credit`            decimal(19, 4) unsigned not null default 0,
  `debit_equiv`       decimal(19, 4) unsigned not null default 0,
  `credit_equiv`      decimal(19, 4) unsigned not null default 0,
  `currency_id`       tinyint unsigned not null,
  `deb_cred_uuid`     char(36),
  `deb_cred_type`     char(1),
  `inv_po_id`         char(36),
  `comment`           text,
  `cost_ctrl_id`      varchar(10),
  `origin_id`         tinyint unsigned not null,
  `user_id`           smallint unsigned not null,
  `session_id`        int unsigned not null,
  `cc_id`             smallint,
  `pc_id`             smallint,
  primary key (`uuid`),
  key `project_id` (`project_id`),
  key `fiscal_year_id` (`fiscal_year_id`),
  key `period_id` (`period_id`),
  key `origin_id` (`origin_id`),
  key `currency_id` (`currency_id`),
  key `user_id` (`user_id`),
  key `session_id` (`session_id`),
  key `cc_id` (`cc_id`),
  key `pc_id` (`pc_id`),
  constraint foreign key (`fiscal_year_id`) references `fiscal_year` (`id`),
  constraint foreign key (`period_id`) references `period` (`id`),
  constraint foreign key (`origin_id`) references `transaction_type` (`id`) on update cascade,
  constraint foreign key (`project_id`) references `project` (`id`) on update cascade,
  constraint foreign key (`currency_id`) references `currency` (`id`) on update cascade,
  constraint foreign key (`user_id`) references `user` (`id`) on update cascade,
  constraint foreign key (`session_id`) references `posting_session` (`id`) on update cascade,
  constraint foreign key (`cc_id`) references `cost_center` (`id`) on update cascade,
  constraint foreign key (`pc_id`) references `profit_center` (`id`) on update cascade
) engine=innodb;

drop table if exists `period_total`;
create table `period_total` (
  `enterprise_id`     smallint unsigned not null,
  `fiscal_year_id`    mediumint unsigned not null,
  `period_id`         mediumint unsigned not null,
  `account_id`        int unsigned not null,
  `credit`            decimal(19,4) unsigned,
  `debit`             decimal(19,4) unsigned,
  `locked`            boolean not null default 0,
  primary key (`enterprise_id`, `fiscal_year_id`, `period_id`, `account_id`),
  key `fiscal_year_id` (`fiscal_year_id`),
  key `account_id` (`account_id`),
  key `enterprise_id` (`enterprise_id`),
  key `period_id` (`period_id`),
  constraint foreign key (`fiscal_year_id`) references `fiscal_year` (`id`),
  constraint foreign key (`account_id`) references `account` (`id`),
  constraint foreign key (`enterprise_id`) references `enterprise` (`id`),
  constraint foreign key (`period_id`) references `period` (`id`)
) engine=innodb;

drop table if exists `group_invoice`;
create table `group_invoice` (
  uuid            char(36) not null,
  project_id      smallint unsigned not null,
  debitor_uuid    char(36) not null,
  group_uuid      char(36) not null,
  note            text,
  authorized_by   varchar(80) not null,
  date            date not null,
  total           decimal(14, 4) not null default 0,
  primary key (`uuid`),
  key `debitor_uuid` (`debitor_uuid`),
  key `project_id` (`project_id`),
  key `group_uuid` (`group_uuid`),
  constraint foreign key (`debitor_uuid`) references `debitor` (`uuid`),
  constraint foreign key (`project_id`) references `project` (`id`),
  constraint foreign key (`group_uuid`) references `debitor_group` (`uuid`)
) engine=innodb;

drop table if exists `group_invoice_item`;
create table `group_invoice_item` (
  uuid              char(36) not null,
  payment_uuid        char(36) not null,
  invoice_uuid        char(36) not null,
  cost              decimal(16, 4) unsigned not null,
  primary key (`uuid`),
  key `payment_uuid` (`payment_uuid`),
  key `invoice_uuid` (`invoice_uuid`),
  constraint foreign key (`payment_uuid`) references `group_invoice` (`uuid`) on delete cascade,
  constraint foreign key (`invoice_uuid`) references `sale` (`uuid`)) engine=innodb;

drop table if exists `journal_log`;
create table `journal_log` (
  `uuid`            char(36) not null,
  `transaction_id`  text not null,
  `justification`   text,
  `date`            date not null,
  `user_id`         smallint unsigned not null,
  primary key (`uuid`),
  foreign key (`user_id`) references `user` (`id`)
) engine=innodb;

drop table if exists `fonction`;
create table `fonction` (
  `id`                    tinyint unsigned not null auto_increment,
  `fonction_txt`          text not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `grade`;
create table `grade` (
  `uuid`                char(36) not null,
  `code`                varchar(30),
  `text`                text,
  `basic_salary`        decimal(19,4) unsigned,
  primary key (`uuid`)
) engine=innodb;

drop table if exists `employee`;
create table  `employee` (
  `id` int unsigned not null auto_increment,
  `code` varchar(20) not null,
  `prenom` text,
  `name` text not null,
  `postnom` text,
  `sexe` varchar(10) not null,
  `dob` date not null,
  `date_embauche` date default null,
  `nb_spouse` int(11) default 0,
  `nb_enfant` int(11) default 0,
  `grade_id` char(36) not null,
  `daily_salary` float default 0,
  `bank` varchar(30) null,
  `bank_account` varchar(30) null,
  `adresse` varchar(50) null,
  `phone` varchar(20) default null,
  `email` varchar(70) default null,
  `fonction_id` tinyint(3) unsigned default null,
  `service_id` smallint(5) unsigned default null,
  `location_id` char(36) default null,
  `creditor_uuid` char(36) default null,
  `debitor_uuid` char(36) default null,
  primary key (`id`),
  key `fonction_id` (`fonction_id`),
  key `service_id` (`service_id`),
  key `location_id` (`location_id`),
  key `creditor_uuid` (`creditor_uuid`),
  key `debitor_uuid` (`debitor_uuid`),
  constraint foreign key (`fonction_id`) references `fonction` (`id`),
  constraint foreign key (`service_id`) references `service` (`id`),
  constraint foreign key (`location_id`) references `village` (`uuid`),
  constraint foreign key (`creditor_uuid`) references `creditor` (`uuid`),
  constraint foreign key (`debitor_uuid`) references `debitor` (`uuid`),
  constraint foreign key (`grade_id`) references `grade` (`uuid`)
) engine=innodb;

drop table if exists `inventory_log`;
create table `inventory_log` (
  `uuid`                char(36) not null,
  `inventory_uuid`      char(36) not null,
  `log_timestamp`       timestamp null default CURRENT_TIMESTAMP,
  `price`               decimal(19,4) unsigned,
  `code`                varchar(30),
  `text`                text,
  primary key (`uuid`),
  key `inventory_uuid` (`inventory_uuid`),
  constraint foreign key (`inventory_uuid`) references `inventory` (`uuid`)
) engine=innodb;

-- TODO Resolve conflicts with sync triggers
-- create trigger `log_inventory_insert`
--   after insert on `inventory`
--   for each row
--   insert into `inventory_log` (`uuid`, `inventory_uuid`, `log_timestamp`, `price`, `code`, `text`) values (UUID(), new.uuid, current_timestamp, new.price, new.code, new.text);
--
-- create trigger `log_inventory_update`
--   after update on `inventory`
--   for each row
--   insert into `inventory_log` (`uuid`, `inventory_uuid`, `log_timestamp`, `price`, `code`, `text`) values (UUID(), new.uuid, current_timestamp, new.price, new.code, new.text);

drop table if exists `debitor_group_history`;
create table `debitor_group_history` (
  `uuid`                  char(36) not null,
  `debitor_uuid`          char(36) not null,
  `debitor_group_uuid`    char(36) not null,
  `income_date`           timestamp not null,
  `user_id`               smallint unsigned not null,
  primary key (`uuid`),
  key `debitor_uuid` (`debitor_uuid`),
  key `debitor_group_uuid` (`debitor_group_uuid`),
  key `user_id` (`user_id`),
  constraint foreign key (`debitor_uuid`) references `debitor` (`uuid`),
  constraint foreign key (`debitor_group_uuid`) references `debitor_group` (`uuid`),
  constraint foreign key (`user_id`) references `user` (`id`)
) engine=innodb;

drop table if exists `client`;
create table `client` (
  `id`                   int unsigned not null auto_increment,
  `name`                 varchar(50) not null,
  `last_name`            varchar(50) not null,
  `address`              varchar(100),
  `debitor_uuid`         char(36),
  primary key (`id`),
  key `debitor_uuid` (`debitor_uuid`),
  constraint foreign key (`debitor_uuid`) references `debitor` (`uuid`)
) engine=innodb;

drop table if exists `beneficiary`;
create table `beneficiary` (
  `id`                   int unsigned not null auto_increment,
  `text`                 varchar(50) not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `primary_cash`;
create table `primary_cash` (
  `reference`       int unsigned not null auto_increment,
  `uuid`            char(36) not null,
  `project_id`      smallint unsigned not null,
  `type`            char(1) not null,
  `date`            date not null,
  `deb_cred_uuid`   char(36) null,
  `deb_cred_type`   varchar(1) null,
  `currency_id`     tinyint unsigned not null,
  `account_id`      int unsigned not null,
  `cost`            decimal(19,4) unsigned not null default 0,
  `user_id`         smallint unsigned not null,
  `description`     text,
  `cash_box_id`     mediumint unsigned not null,
  `origin_id`       tinyint unsigned not null,
  primary key (`uuid`),
  key `project_id` (`project_id`),
  key `reference` (`reference`),
  key `currency_id` (`currency_id`),
  key `user_id` (`user_id`),
  key `cash_box_id`    (`cash_box_id`),
  key `account_id`     (`account_id`),
  key `origin_id`      (`origin_id`),
  constraint foreign key (`project_id`) references `project` (`id`),
  constraint foreign key (`currency_id`) references `currency` (`id`),
  constraint foreign key (`user_id`) references `user` (`id`),
  constraint foreign key (`cash_box_id`) references `cash_box` (`id`),
  constraint foreign key (`account_id`) references `account` (`id`),
  constraint foreign key (`origin_id`) references `primary_cash_module` (`id`)
) engine=innodb;

drop table if exists `primary_cash_item`;
create table `primary_cash_item` (
  `uuid`              varchar(36) not null,
  `primary_cash_uuid` varchar(36) not null,
  `debit`             decimal (19, 4) unsigned not null default 0,
  `credit`            decimal (19, 4) unsigned not null default 0,
  `inv_po_id`         varchar(36),
  `document_uuid`     varchar(36),
  primary key (`uuid`),
  key `primary_cash_uuid` (`primary_cash_uuid`),
  constraint foreign key (`primary_cash_uuid`) references `primary_cash` (`uuid`)
) engine=innodb;

drop table if exists `caution`;
create table `caution` (
  `reference`           int unsigned not null auto_increment,
  `uuid`                char(36) not null,
  `value`               decimal(19,4) unsigned not null,
  `date`                timestamp not null,
  `project_id`          smallint unsigned not null,
  `debitor_uuid`        char(36) not null,
  `currency_id`         tinyint unsigned not null,
  `user_id`             smallint unsigned not null,
  `cash_box_id`         mediumint unsigned null,
  `description`         text,
  primary key (`uuid`),
  key `project_id` (`project_id`),
  key `reference` (`reference`),
  key `debitor_uuid` (`debitor_uuid`),
  key `currency_id` (`currency_id`),
  key `cash_box_id`  (`cash_box_id`),
  key `user_id` (`user_id`),
  constraint foreign key (`project_id`) references `project` (`id`),
  constraint foreign key (`debitor_uuid`) references `debitor` (`uuid`),
  constraint foreign key (`currency_id`) references `currency` (`id`),
  constraint foreign key (`cash_box_id`) references `cash_box` (`id`),
  constraint foreign key (`user_id`) references `user` (`id`)
) engine=innodb;

drop table if exists `purchase`;
create table `purchase` (
  `project_id`        smallint unsigned not null,
  `reference`         int unsigned not null auto_increment,
  `uuid`              char(36) not null,
  `cost`              decimal(19,4) unsigned not null default '0',
  `currency_id`       tinyint unsigned not null,
  `creditor_uuid`     char(36) not null,
  `purchaser_id`      smallint unsigned not null,
  `employee_id`       int unsigned null,
  `discount`          mediumint unsigned default '0',
  `purchase_date`     date not null,
  `timestamp`         timestamp default current_timestamp,
  `note`              text default null,
  `paid`              boolean not null default 0,
  `paid_uuid`         char(36),
  `confirmed`         boolean not null default 0,
  `closed`            boolean not null default 0,
  `is_direct`         boolean not null default 0,
  primary key (`uuid`),
  key `project_id` (`project_id`),
  key `reference` (`reference`),
  key `creditor_uuid` (`creditor_uuid`),
  key `purchaser_id` (`purchaser_id`),
  key `paid_uuid`    (`paid_uuid`),
  constraint foreign key (`project_id`) references `project` (`id`),
  constraint foreign key (`creditor_uuid`) references `creditor` (`uuid`),
  constraint foreign key (`purchaser_id`) references `user` (`id`),
  constraint foreign key (`paid_uuid`)    references `primary_cash` (`uuid`)
) engine=innodb;

drop table if exists `purchase_item`;
create table `purchase_item` (
  `purchase_uuid`     char(36) not null,
  `uuid`              char(36) not null,
  `inventory_uuid`    char(36) not null,
  `quantity`          int unsigned default '0',
  `unit_price`        decimal(10,4) unsigned not null,
  `total`             decimal(10,4) unsigned,
  primary key (`uuid`),
  key `purchase_uuid` (`purchase_uuid`),
  key `inventory_uuid` (`inventory_uuid`),
  constraint foreign key (`purchase_uuid`) references `purchase` (`uuid`) on delete cascade,
  constraint foreign key (`inventory_uuid`) references `inventory` (`uuid`)
) engine=innodb;

drop table if exists `stock`;
create table `stock` (
  `inventory_uuid`         char(36) not null,
  `tracking_number`        char(50) not null,
  `expiration_date`        date not null,
  `entry_date`             date not null,
  `lot_number`             varchar(70) not null,
  `purchase_order_uuid`    char(36) null,
  `quantity`               int not null default 0,
  primary key (`tracking_number`),
  key `inventory_uuid` (`inventory_uuid`),
  key `purchase_order_uuid` (`purchase_order_uuid`),
  constraint foreign key (`inventory_uuid`) references `inventory` (`uuid`),
  constraint foreign key (`purchase_order_uuid`) references `purchase` (`uuid`)
) engine=innodb;

drop table if exists `movement`;
create table `movement` (
  `uuid`                    char(36) not null,
  `document_id`             char(36) not null,
  `depot_entry`             char(36),
  `depot_exit`              char(36),
  `tracking_number`         char(50) not null,
  `quantity`                int not null default 0,
  `date`                    date,
  primary key (`uuid`),
  key `tracking_number` (`tracking_number`),
  key `depot_exit` (`depot_exit`),
  constraint foreign key (`tracking_number`) references `stock` (`tracking_number`),
  constraint foreign key (`depot_exit`) references `depot` (`uuid`)
) engine=innodb;

drop table if exists `rubric`;
create table `rubric` (
  `id`                      int unsigned auto_increment not null,
  `label`                   text,
  `abbr`                    varchar(4) null,
  `is_discount`             boolean,
  `is_percent`              boolean,
  `value`                   float default 0,
  primary key (`id`)
) engine=innodb;

drop table if exists `config_rubric`;
create table `config_rubric` (
  `id`                      int unsigned auto_increment not null,
  `label`                   text,
  primary key (`id`)
) engine=innodb;

drop table if exists `config_rubric_item`;
create table `config_rubric_item` (
  `id`                      int unsigned auto_increment not null,
  `config_rubric_id`        int unsigned not null,
  `rubric_id`               int unsigned not null,
  `payable`                 boolean,
  primary key (`id`),
  key `config_rubric_id` (`config_rubric_id`),
  key `rubric_id` (`rubric_id`),
  constraint foreign key (`config_rubric_id`) references `config_rubric` (`id`),
  constraint foreign key (`rubric_id`) references `rubric` (`id`)
) engine=innodb;

drop table if exists `tax`;
create table `tax` (
  `id`                      int unsigned auto_increment not null,
  `label`                   text,
  `abbr`                    varchar(4) null,
  `is_employee`             boolean,
  `is_percent`              boolean,
  `is_ipr`                  boolean,            
  `four_account_id`         int unsigned null,
  `six_account_id`          int unsigned null,
  `value`                   float default 0,
  primary key (`id`),
  key `four_account_id` (`four_account_id`),
  key `six_account_id` (`six_account_id`),
  constraint foreign key (`four_account_id`) references `account` (`id`),
  constraint foreign key (`six_account_id`) references `account` (`id`)
) engine=innodb;

drop table if exists `config_tax`;
create table `config_tax` (
  `id`                      int unsigned auto_increment not null,
  `label`                   text,
  primary key (`id`)
) engine=innodb;

drop table if exists `config_tax_item`;
create table `config_tax_item` (
  `id`                      int unsigned auto_increment not null,
  `config_tax_id`           int unsigned not null,
  `tax_id`                  int unsigned not null,
  `payable`                 boolean,
  primary key (`id`),
  key `config_tax_id` (`config_tax_id`),
  key `tax_id` (`tax_id`),
  constraint foreign key (`config_tax_id`) references `config_tax` (`id`),
  constraint foreign key (`tax_id`) references `tax` (`id`)
) engine=innodb;

drop table if exists `cotisation`;
create table `cotisation` (
  `id`                      int unsigned auto_increment not null,
  `label`                   text,
  `abbr`                    varchar(4) null,
  `is_employee`             boolean,
  `is_percent`              boolean,
  `four_account_id`         int unsigned null,
  `six_account_id`          int unsigned null,
  `value`                   float default 0,
  primary key (`id`),
  key `four_account_id` (`four_account_id`),
  key `six_account_id` (`six_account_id`),
  constraint foreign key (`four_account_id`) references `account` (`id`),
  constraint foreign key (`six_account_id`) references `account` (`id`)
) engine=innodb;

drop table if exists `config_cotisation`;
create table `config_cotisation` (
  `id`                      int unsigned auto_increment not null,
  `label`                   text,
  primary key (`id`)
) engine=innodb;

drop table if exists `config_cotisation_item`;
create table `config_cotisation_item` (
  `id`                      int unsigned auto_increment not null,
  `config_cotisation_id`    int unsigned not null,
  `cotisation_id`           int unsigned not null,
  `payable`                 boolean,
  primary key (`id`),
  key `config_cotisation_id` (`config_cotisation_id`),
  key `cotisation_id` (`cotisation_id`),
  constraint foreign key (`config_cotisation_id`) references `config_cotisation` (`id`),
  constraint foreign key (`cotisation_id`) references `cotisation` (`id`)
) engine=innodb;

drop table if exists `config_accounting`;
create table `config_accounting` (
  `id`                      int unsigned auto_increment not null,
  `label`                   text,
  `account_id`              int unsigned not null,
  primary key (`id`),
  key `account_id` (`account_id`),
  constraint foreign key (`account_id`) references `account` (`id`)
) engine=innodb;

drop table if exists `paiement_period`;
create table `paiement_period` (
  `id`                      int unsigned auto_increment not null,
  `config_tax_id`           int unsigned not null,
  `config_rubric_id`        int unsigned not null,
  `config_cotisation_id`    int unsigned not null,
  `config_accounting_id`    int unsigned not null,
  `label`                   text,
  `dateFrom`                date not null,
  `dateTo`                  date not null,
  primary key (`id`),
  key `config_tax_id` (`config_tax_id`),
  key `config_rubric_id` (`config_rubric_id`),
  key `config_cotisation_id` (`config_cotisation_id`),
  key `config_accounting_id` (`config_accounting_id`),
  constraint foreign key (`config_tax_id`) references `config_tax` (`id`),
  constraint foreign key (`config_rubric_id`) references `config_rubric` (`id`),
  constraint foreign key (`config_cotisation_id`) references `config_cotisation` (`id`),
  constraint foreign key (`config_accounting_id`) references `config_accounting` (`id`)
) engine=innodb;

drop table if exists `config_paiement_period`;
create table `config_paiement_period` (
  `id`                      int unsigned auto_increment not null,
  `paiement_period_id`      int unsigned not null,
  `weekFrom`                date not null,
  `weekTo`                  date not null,
  primary key (`id`),
  key `paiement_period_id` (`paiement_period_id`),
  constraint foreign key (`paiement_period_id`) references `paiement_period` (`id`)
) engine=innodb;

drop table if exists `paiement`;
create table `paiement` (
  `uuid`                    char(36) not null,
  `employee_id`             int unsigned not null,
  `paiement_period_id`      int unsigned not null,
  `currency_id`             tinyint unsigned,
  `paiement_date`           date,
  `working_day`             int unsigned not null,
  `net_before_tax`          float default 0,
  `net_after_tax`           float default 0,
  `net_salary`              float default 0,
  `is_paid`                 tinyint null default 0,
  primary key (`uuid`),
  key `employee_id` (`employee_id`),
  key `paiement_period_id` (`paiement_period_id`),
  key `currency_id` (`currency_id`),
  constraint foreign key (`employee_id`) references `employee` (`id`),
  constraint foreign key (`paiement_period_id`) references `paiement_period` (`id`),
  constraint foreign key (`currency_id`) references `currency` (`id`)
) engine=innodb;


drop table if exists `rubric_paiement`;
create table `rubric_paiement` (
  `id`                      int unsigned auto_increment not null,
  `paiement_uuid`           char(36) not null,
  `rubric_id`               int unsigned not null,
  `value`                   float default 0,
  primary key (`id`),
  key `paiement_uuid` (`paiement_uuid`),
  key `rubric_id` (`rubric_id`),
  constraint foreign key (`paiement_uuid`) references `paiement` (`uuid`),
  constraint foreign key (`rubric_id`) references `rubric` (`id`)
) engine=innodb;

drop table if exists `tax_paiement`;
create table `tax_paiement` (
  `id`                      int unsigned auto_increment not null,
  `paiement_uuid`           char(36) not null,
  `tax_id`                  int unsigned not null,
  `value`                   float default 0,
  `posted`                  boolean,
  primary key (`id`),
  key `paiement_uuid` (`paiement_uuid`),
  key `tax_id` (`tax_id`),
  constraint foreign key (`paiement_uuid`) references `paiement` (`uuid`),
  constraint foreign key (`tax_id`) references `tax` (`id`)
) engine=innodb;

drop table if exists `cotisation_paiement`;
create table `cotisation_paiement` (
  `id`                      int unsigned auto_increment not null,
  `paiement_uuid`           char(36) not null,
  `cotisation_id`           int unsigned not null,
  `value`                   float default 0,
  `posted`                  boolean,
  primary key (`id`),
  key `paiement_uuid` (`paiement_uuid`),
  key `cotisation_id` (`cotisation_id`),
  constraint foreign key (`paiement_uuid`) references `paiement` (`uuid`),
  constraint foreign key (`cotisation_id`) references `cotisation` (`id`)
) engine=innodb;


drop table if exists `offday`;
create table `offday` (
  `id`                      int unsigned auto_increment not null,
  `label`                   text,
  `date`                    date not null,
  `percent_pay`             float default 100,
  primary key (`id`)
) engine=innodb;

drop table if exists `hollyday`;
create table `hollyday` (
  `id`                      int unsigned auto_increment not null,
  `employee_id`             int unsigned not null,
  `percentage`              float default 0,
  `label`                   text,
  `dateFrom`                date,
  `dateTo`                  date,
  primary key (`id`),
  key `employee_id` (`employee_id`),
  constraint foreign key (`employee_id`) references `employee` (`id`)
) engine=innodb;

drop table if exists `hollyday_paiement`;
create table `hollyday_paiement` (
  `hollyday_id`             int unsigned not null,
  `hollyday_nbdays`         int unsigned not null,
  `hollyday_percentage`     float default 0,
  `paiement_uuid`           char(36) not null,
  constraint foreign key (`paiement_uuid`) references `paiement` (`uuid`),
  constraint foreign key (`hollyday_id`) references `hollyday` (`id`)
) engine=innodb;


drop table if exists `taxe_ipr`;
create table `taxe_ipr` (
  `id`                      int unsigned auto_increment not null,
  `taux`                    float not null,
  `tranche_annuelle_debut`  float,
  `tranche_annuelle_fin`    float,
  `tranche_mensuelle_debut` float,
  `tranche_mensuelle_fin`   float,
  `ecart_annuel`            float,
  `ecart_mensuel`           float,
  `impot_annuel`            float,
  `impot_mensuel`           float,
  `cumul_annuel`            float,
  `cumul_mensuel`           float,
  `currency_id`             int,
  primary key (`id`)
) engine=innodb;

drop table if exists `donor`;
create table `donor` (
  `id`                      int unsigned auto_increment not null,
  `name`                    text not null,
  primary key (`id`)
) engine=innodb;

drop table if exists `donations`;
create table `donations` (
  `uuid`                    char(36) not null,
  `donor_id`                int not null,
  `employee_id`             int not null,
  `date`                    date,
  primary key (`uuid`)
) engine=innodb;


drop table if exists `donation_item`;
create table `donation_item` (
  `uuid`                    char(36) not null,
  `donation_uuid`           char(36) not null,
  `tracking_number`         char(36) not null,
  primary key (`uuid`)
) engine=innodb;
