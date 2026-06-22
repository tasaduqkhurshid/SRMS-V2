const PRIMARY_KEY_TYPE = {
  BIGINT: "BIGINT",
  INT: "INT"
};

const upEntryQuery = queryInterface => {
  return queryInterface.sequelize
    .query("SET FOREIGN_KEY_CHECKS = 0")
    .then(() => queryInterface.sequelize.query("ALTER DATABASE emerchan_payg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"));
};

const upExitQuery = queryInterface => {
  return queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
};

const downEntryQuery = queryInterface => {
  return queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
};

const downExitQuery = queryInterface => {
  return queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
};

const updateDataQuery = (queryInterface, tableName, dataToUpdate, primaryKey = "id") => {
  if (!(dataToUpdate && dataToUpdate.length)) {
    throw new Error("Nothing to update!");
  }

  const queries = dataToUpdate.map(data => {
    const queryParams = [];
    const dataRow = Object.keys(data)
      .filter(fieldName => fieldName !== primaryKey)
      .map(fieldName => {
        queryParams.push(data[fieldName]);
        return `${fieldName} = ?`;
      })
      .join(",");
    queryParams.push(data[primaryKey]);
    return [`UPDATE ${tableName} SET ${dataRow} WHERE ${primaryKey} = ?`, queryParams];
  });

  return Promise.all(queries.map(([query, queryParams]) => queryInterface.sequelize.query(query, { replacements: queryParams })));
};

const setTimestampColumnToNull = (queryInterface, tableName, columnName) => {
  return Promise.resolve()
    .then(() => {
      return queryInterface.sequelize.query(`ALTER TABLE ${tableName} CHANGE COLUMN ${columnName} ${columnName} TIMESTAMP NULL DEFAULT NULL`);
    })
    .then(() => {
      return queryInterface.sequelize.query(`UPDATE ${tableName} SET ${columnName}=null where ${columnName}='0000-00-00 00:00:00'`);
    });
};

const setTimestampColumnToNullAndRename = (queryInterface, tableName, columnName, newColumnName = null) => {
  let columnRenamed = columnName;
  if (newColumnName) {
    columnRenamed = newColumnName;
  }
  return Promise.resolve()
    .then(() => {
      return queryInterface.sequelize.query(`ALTER TABLE ${tableName} CHANGE COLUMN ${columnName} ${columnRenamed} TIMESTAMP NULL DEFAULT NULL`);
    })
    .then(() => {
      return queryInterface.sequelize.query(`UPDATE ${tableName} SET ${columnRenamed}=null where ${columnRenamed}='0000-00-00 00:00:00'`);
    });
};

const setDateColumnToNull = (queryInterface, tableName, columnName) => {
  return Promise.resolve()
    .then(() => {
      return queryInterface.sequelize.query(`ALTER TABLE ${tableName} CHANGE COLUMN ${columnName} ${columnName} DATE NULL DEFAULT NULL`);
    })
    .then(() => {
      return queryInterface.sequelize.query(`UPDATE ${tableName} SET ${columnName}=null where ${columnName}='0000-00-00 00:00:00'`);
    });
};

const setDateColumnToNullAndRename = (queryInterface, tableName, columnName, newColumnName = null) => {
  let columnRenamed = columnName;
  if (newColumnName) {
    columnRenamed = newColumnName;
  }
  return Promise.resolve()
    .then(() => {
      return queryInterface.sequelize.query(`ALTER TABLE ${tableName} CHANGE COLUMN ${columnName} ${columnRenamed} DATE NULL DEFAULT NULL`);
    })
    .then(() => {
      return queryInterface.sequelize.query(`UPDATE ${tableName} SET ${columnRenamed}=null where ${columnRenamed}='0000-00-00 00:00:00'`);
    });
};

const updateTimestampColumnToNull = (queryInterface, tableName, columnName) => {
  return queryInterface.sequelize.query(`UPDATE ${tableName}
  SET ${columnName}=NULL`);
};

const addUniqueIndex = (queryInterface, tableName, uniqueColumns, indexNumber = 1) => {
  return queryInterface.sequelize.query(
    `ALTER TABLE \`${tableName}\` ADD UNIQUE INDEX \`${tableName}_unique_index_${indexNumber}\` (\`${uniqueColumns.join("`,`")}\`)`
  );
};

const dropUniqueIndex = (queryInterface, tableName, indexNumber = 1) => {
  return queryInterface.sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${tableName}_unique_index_${indexNumber}\``);
};

const addIndex = (queryInterface, tableName, columnsToIndex, indexNumber = 1) => {
  return queryInterface.sequelize.query(
    `ALTER TABLE \`${tableName}\` ADD INDEX \`${tableName}_unique_index_${indexNumber}\` (\`${columnsToIndex.join("`,`")}\`)`
  );
};

const dropIndex = (queryInterface, tableName, indexNumber = 1) => {
  return dropUniqueIndex(queryInterface, tableName, indexNumber);
};

const executeSQLQuery = (queryInterface, sqlQuery) => {
  return queryInterface.sequelize.query(sqlQuery);
};

const bulkUpsert = async (queryInterface, tableName, records, updateFields = [], primaryKey = "id") => {
  if (!records || !records.length) {
    return Promise.resolve();
  }

  const dialect = queryInterface.sequelize.getDialect();

  // collect columns (preserve order from first record, but include any others)
  const cols = Array.from(new Set(records.reduce((acc, r) => acc.concat(Object.keys(r)), [])));

  const valuesSql = records
    .map(r => `(${cols.map(c => queryInterface.sequelize.escape(r[c] === undefined ? null : r[c])).join(",")})`)
    .join(",");

  if (dialect === "sqlite") {
    const sql = `INSERT OR REPLACE INTO ${tableName} (${cols.join(",")}) VALUES ${valuesSql};`;
    try {
      return await queryInterface.sequelize.query(sql);
    } catch (err) {
      throw new Error(`bulkUpsert sqlite failed for table ${tableName}: ${err.message} -- sql: ${sql}`);
    }
  }

  if (dialect === "mysql" || dialect === "mariadb") {
    const updates = (updateFields && updateFields.length) ? updateFields : cols.filter(c => c !== primaryKey);
    const updateSql = updates.map(f => `${f}=VALUES(${f})`).join(", ");
    const sql = `INSERT INTO ${tableName} (${cols.join(",")}) VALUES ${valuesSql} ON DUPLICATE KEY UPDATE ${updateSql};`;
    try {
      return await queryInterface.sequelize.query(sql);
    } catch (err) {
      throw new Error(`bulkUpsert mysql failed for table ${tableName}: ${err.message} -- sql: ${sql}`);
    }
  }

  if (dialect === "postgres" || dialect === "postgresql") {
    if (!cols.includes(primaryKey)) {
      return queryInterface.bulkInsert(tableName, records);
    }
    const updates = (updateFields && updateFields.length) ? updateFields : cols.filter(c => c !== primaryKey);
    const updateSql = updates.map(f => `${f} = EXCLUDED.${f}`).join(", ");
    const sql = `INSERT INTO ${tableName} (${cols.join(",")}) VALUES ${valuesSql} ON CONFLICT (${primaryKey}) DO UPDATE SET ${updateSql};`;
    try {
      return await queryInterface.sequelize.query(sql);
    } catch (err) {
      throw new Error(`bulkUpsert postgres failed for table ${tableName}: ${err.message} -- sql: ${sql}`);
    }
  }

  // fallback to normal bulkInsert when dialect is unknown
  try {
    return await queryInterface.bulkInsert(tableName, records);
  } catch (err) {
    throw new Error(`bulkUpsert fallback bulkInsert failed for table ${tableName}: ${err.message}`);
  }
};

const modifyPrimaryKeyField = ({ queryInterface, tableName, primaryKeyType = PRIMARY_KEY_TYPE.INT, primaryKeyIndexStartWith = 10000 }) => {
  const modifiedPrimaryKeyType = primaryKeyType && primaryKeyType === PRIMARY_KEY_TYPE.BIGINT ? " BIGINT(20) UNSIGNED " : " INT(10) UNSIGNED ";
  return queryInterface.sequelize.query(
    `ALTER TABLE ${tableName} MODIFY id ${modifiedPrimaryKeyType} NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=${primaryKeyIndexStartWith}`
  );
};
const modifyCreateUpdateTimestampFields = ({ queryInterface, tableName, columnCreatedAt = "created_at", columnUpdateAt = "updated_at" }) => {
  return queryInterface.sequelize.query(
    `ALTER TABLE ${tableName}
        CHANGE COLUMN ${columnCreatedAt} ${columnCreatedAt} TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ,
        CHANGE COLUMN ${columnUpdateAt} ${columnUpdateAt} TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`
  );
};

const addForeignKeyConstraint = ({ queryInterface, tableName, constraintName, key, foreignKeyReferenceTable, foreignKeyReferenceTableKey }) => {
  return queryInterface.sequelize.query(`ALTER TABLE ${tableName}
   ADD CONSTRAINT ${constraintName}
   FOREIGN KEY (${key}) 
   REFERENCES ${foreignKeyReferenceTable} (${foreignKeyReferenceTableKey})`);
};

const dropForeignKeyConstraint = ({ queryInterface, tableName, constraintName }) => {
  return queryInterface.sequelize.query(`ALTER TABLE ${tableName}
    DROP CONSTRAINT ${constraintName};`);
};

module.exports = {
  upEntryQuery,
  upExitQuery,
  downEntryQuery,
  downExitQuery,
  updateDataQuery,

  setTimestampColumnToNull,
  setTimestampColumnToNullAndRename,
  setDateColumnToNull,
  setDateColumnToNullAndRename,
  updateTimestampColumnToNull,

  addUniqueIndex,
  dropUniqueIndex,

  addIndex,
  dropIndex,

  executeSQLQuery,
  bulkUpsert,
  modifyPrimaryKeyField,
  PRIMARY_KEY_TYPE,

  modifyCreateUpdateTimestampFields,
  addForeignKeyConstraint,
  dropForeignKeyConstraint
};
