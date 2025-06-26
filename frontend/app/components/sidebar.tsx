// frontend/components/Sidebar.tsx (No changes needed here)
import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <nav className="sidebar">
      <h3>営業管理システム</h3>
      <ul>
        <li>
          <Link href="/">Dashboard</Link>
        </li>
        {/* Registration Dropdown */}
        <li className="dropdown">
          <a href="#" className="dropdown-toggle">登録 <span className="arrow">▼</span></a>
          <ul className="dropdown-menu">
            <li><Link href="/register/user">ユーザー</Link></li>
            <li><Link href="/register/company">会社</Link></li>
            <li><Link href="/register/deal">取引</Link></li>
            <li><Link href="/register/activity">活動</Link></li>
            <li><Link href="/register/agency">代理店</Link></li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;