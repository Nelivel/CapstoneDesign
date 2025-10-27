// src/pages/UserManagementPage.jsx
import React, { useState, useMemo } from 'react'; // useMemo 추가
import { useNavigation } from '../context/NavigationContext';
import { MOCK_ADMIN_USERS } from '../mock-admin-users';
import './UserManagementPage.css';

function UserManagementPage() {
  const { navigate } = useNavigation();
  const [users, setUsers] = useState(MOCK_ADMIN_USERS); // 사용자 상태 관리 추가
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, USER, ADMIN
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, BANNED

  // 검색어, 필터 변경 시 사용자 목록 필터링
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = user.username.toLowerCase().includes(lowerSearchTerm) ||
                            user.email.toLowerCase().includes(lowerSearchTerm);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // 사용자 상태 변경 핸들러 (차단/해제)
  const handleStatusChange = (userId) => {
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE' }
          : user
      )
    );
    alert('사용자 상태가 변경되었습니다. (실제 DB 반영 필요)');
  };

  return (
    <div className="user-management-page">
      <header className="user-management-header">
        <button onClick={() => navigate('/admin')} className="back-button" style={{position: 'static'}}>{'<'}</button>
        <h2 className="user-management-title">사용자 관리</h2>
      </header>
      <main className="user-management-main">
        {/* 검색 및 필터 영역 */}
        <div className="filters">
          <input
            type="text"
            placeholder="닉네임 또는 이메일 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">전체 역할</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">전체 상태</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BANNED">BANNED</option>
          </select>
        </div>

        {/* 사용자 테이블 */}
        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>닉네임</th>
                <th>이메일</th>
                <th>권한</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  {/* 상태별 텍스트 색상 적용 */}
                  <td className={user.status === 'ACTIVE' ? 'status-active' : 'status-banned'}>
                    {user.status}
                  </td>
                  <td className="user-actions">
                    <button className="view-button" onClick={() => alert(`사용자 ${user.username} 상세 보기`)}>보기</button>
                    <button className="edit-button" onClick={() => alert(`사용자 ${user.username} 권한 수정`)}>수정</button>
                    {/* 상태 변경 버튼 */}
                    <button
                      className={user.status === 'ACTIVE' ? 'ban-button' : 'unban-button'}
                      onClick={() => handleStatusChange(user.id)}
                    >
                      {user.status === 'ACTIVE' ? '차단' : '해제'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default UserManagementPage;