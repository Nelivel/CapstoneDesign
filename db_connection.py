"""
데이터베이스 연결 관리 모듈
MySQL과 PostgreSQL을 환경변수로 선택하여 사용
"""
import os
from dotenv import load_dotenv
from typing import Optional

class Database:
    """통합 데이터베이스 연결 클래스"""

    def __init__(self, db_type: Optional[str] = None):
        """
        Args:
            db_type: 'mysql' 또는 'postgresql'. None이면 환경변수 DB_TYPE 사용
        """
        load_dotenv()

        # DB 타입 결정 (환경변수 우선)
        self.db_type = (db_type or os.environ.get("DB_TYPE", "mysql")).lower()

        if self.db_type == "mysql":
            self._connect_mysql()
        elif self.db_type in ["postgresql", "postgres", "pg"]:
            self._connect_postgresql()
        else:
            raise ValueError(f"지원하지 않는 DB 타입: {self.db_type}")

        self.BATCH_SIZE = int(os.environ.get("DB_BATCH_SIZE", "500"))
        self.cursor = self.conn.cursor()

    def _connect_mysql(self):
        """MySQL 연결"""
        try:
            import MySQLdb
        except ImportError:
            raise ImportError("MySQLdb를 설치하세요: pip install mysqlclient")

        ssl_config = None
        if os.getenv("MYSQL_SSL_CA"):
            ssl_config = {"ca": os.getenv("MYSQL_SSL_CA")}

        self.conn = MySQLdb.connect(
            user=os.environ.get("MYSQL_USER"),
            passwd=os.environ.get("MYSQL_PASSWD"),
            host=os.environ.get("MYSQL_HOST"),
            db=os.environ.get("MYSQL_DB"),
            port=int(os.environ.get("MYSQL_PORT", "3306")),
            autocommit=False,
            charset="utf8mb4",
            use_unicode=True,
            ssl=ssl_config,
        )
        print(f"MySQL 연결 성공: {self.conn.get_host_info()}")

    def _connect_postgresql(self):
        """PostgreSQL 연결"""
        try:
            import psycopg2
        except ImportError:
            raise ImportError("psycopg2를 설치하세요: pip install psycopg2-binary")

        self.conn = psycopg2.connect(
            user=os.environ.get("POSTGRES_USER"),
            password=os.environ.get("POSTGRES_PASSWORD"),
            host=os.environ.get("POSTGRES_HOST"),
            database=os.environ.get("POSTGRES_DB"),
            port=int(os.environ.get("POSTGRES_PORT", "5432")),
        )
        self.conn.autocommit = False
        print(f"PostgreSQL 연결 성공: {os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT', '5432')}")

    def placeholder(self, count: int = 1) -> str:
        """
        DB 타입에 맞는 플레이스홀더 반환
        MySQL: %s, PostgreSQL: %s (둘 다 같음)

        Args:
            count: 플레이스홀더 개수

        Returns:
            쉼표로 구분된 플레이스홀더 문자열 (예: "%s, %s, %s")
        """
        return ", ".join(["%s"] * count)

    def commit(self):
        """트랜잭션 커밋"""
        self.conn.commit()

    def rollback(self):
        """트랜잭션 롤백"""
        self.conn.rollback()

    def close(self):
        """연결 종료"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

    def __enter__(self):
        """with 문 지원"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """with 문 종료 시 자동 close"""
        if exc_type:
            self.rollback()
        else:
            self.commit()
        self.close()


# 하위 호환성을 위한 함수
def get_database(db_type: Optional[str] = None) -> Database:
    """
    데이터베이스 인스턴스 생성

    Args:
        db_type: 'mysql' 또는 'postgresql'. None이면 환경변수 사용

    Returns:
        Database 인스턴스

    Example:
        db = get_database('mysql')
        db = get_database('postgresql')
        db = get_database()  # .env의 DB_TYPE 사용
    """
    return Database(db_type)
