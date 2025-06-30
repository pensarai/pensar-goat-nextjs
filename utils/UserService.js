import { getConnection } from './database';

export class UserService {
  constructor(config) {
    this.config = config;
  }
  
  async searchUsers(searchParams) {
    const processedParams = this._processSearchParams(searchParams);
    return await this._executeSearch(processedParams);
  }
  
  _processSearchParams(params) {
    return {
      tableName: `${this.config.tablePrefix}${params.entityType || 'data'}`,
      conditions: params.filters || {}
    };
  }
  
  async _executeSearch(processed) {
    const tableName = processed.tableName;
    const conditions = processed.conditions.status || 'active';
    
    const connection = await getConnection();
    
    try {
      const query = `SELECT * FROM ${tableName} WHERE status = '${conditions}'`;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      await connection.end();
    }
  }
}