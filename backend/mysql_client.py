import mysql.connector
from mysql.connector import Error, pooling
import os
import json
from typing import Dict, List, Optional, Any
import uuid
from datetime import datetime


class MySQLClient:
    def __init__(self):
        self.connection_pool = self._create_connection_pool()
    
    def _create_connection_pool(self):
        """Create a connection pool for MySQL"""
        try:
            config = {
                'host': os.environ.get('MYSQL_HOST', 'localhost'),
                'database': os.environ.get('MYSQL_DATABASE', 'fitness_app'),
                'user': os.environ.get('MYSQL_USER', 'fitness_user'),
                'password': os.environ.get('MYSQL_PASSWORD', 'fitness_password'),
                'port': int(os.environ.get('MYSQL_PORT', '3306')),
                'pool_name': 'fitness_pool',
                'pool_size': 5,
                'pool_reset_session': True,
                'autocommit': True
            }
            
            return pooling.MySQLConnectionPool(**config)
        except Error as e:
            raise Exception(f"Error creating MySQL connection pool: {e}")
    
    def get_connection(self):
        """Get a connection from the pool"""
        try:
            return self.connection_pool.get_connection()
        except Error as e:
            raise Exception(f"Error getting connection from pool: {e}")
    
    def execute_query(self, query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = False):
        """Execute a query with optional parameters"""
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=True)
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            else:
                return cursor.rowcount
                
        except Error as e:
            if connection:
                connection.rollback()
            raise Exception(f"Database error: {e}")
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    def insert_one(self, table: str, data: Dict[str, Any]) -> str:
        """Insert one record and return the ID"""
        # Generate UUID if not provided
        if 'id' not in data:
            data['id'] = str(uuid.uuid4())
        
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        
        try:
            self.execute_query(query, tuple(data.values()))
            return data['id']
        except Exception as e:
            raise Exception(f"Error inserting into {table}: {e}")
    
    def find_one(self, table: str, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find one record by filter"""
        where_clause = ' AND '.join([f"{k} = %s" for k in filter_dict.keys()])
        query = f"SELECT * FROM {table} WHERE {where_clause}"
        
        try:
            result = self.execute_query(query, tuple(filter_dict.values()), fetch_one=True)
            return result
        except Exception as e:
            raise Exception(f"Error finding in {table}: {e}")
    
    def find_all(self, table: str, filter_dict: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Find all records matching filter"""
        if filter_dict:
            where_clause = ' AND '.join([f"{k} = %s" for k in filter_dict.keys()])
            query = f"SELECT * FROM {table} WHERE {where_clause}"
            params = tuple(filter_dict.values())
        else:
            query = f"SELECT * FROM {table}"
            params = None
        
        try:
            result = self.execute_query(query, params, fetch_all=True)
            return result or []
        except Exception as e:
            raise Exception(f"Error finding all in {table}: {e}")
    
    def update_one(self, table: str, filter_dict: Dict[str, Any], update_dict: Dict[str, Any]) -> int:
        """Update one record"""
        set_clause = ', '.join([f"{k} = %s" for k in update_dict.keys()])
        where_clause = ' AND '.join([f"{k} = %s" for k in filter_dict.keys()])
        query = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"
        
        params = tuple(update_dict.values()) + tuple(filter_dict.values())
        
        try:
            return self.execute_query(query, params)
        except Exception as e:
            raise Exception(f"Error updating {table}: {e}")
    
    def delete_one(self, table: str, filter_dict: Dict[str, Any]) -> int:
        """Delete one record"""
        where_clause = ' AND '.join([f"{k} = %s" for k in filter_dict.keys()])
        query = f"DELETE FROM {table} WHERE {where_clause}"
        
        try:
            return self.execute_query(query, tuple(filter_dict.values()))
        except Exception as e:
            raise Exception(f"Error deleting from {table}: {e}")
    
    def count(self, table: str, filter_dict: Dict[str, Any] = None) -> int:
        """Count records"""
        if filter_dict:
            where_clause = ' AND '.join([f"{k} = %s" for k in filter_dict.keys()])
            query = f"SELECT COUNT(*) as count FROM {table} WHERE {where_clause}"
            params = tuple(filter_dict.values())
        else:
            query = f"SELECT COUNT(*) as count FROM {table}"
            params = None
        
        try:
            result = self.execute_query(query, params, fetch_one=True)
            return result['count'] if result else 0
        except Exception as e:
            raise Exception(f"Error counting in {table}: {e}")


# Create global instance
mysql_client = MySQLClient()