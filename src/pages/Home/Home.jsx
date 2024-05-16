import Header from "../../components/Header/Header";
import React, {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom";
import './Home.css';
import TotalBoardList from "../BoardList/TotalBoardList";
import DailyBoardList from "../BoardList/DailyBoardList";
import HelpBoardList from "../BoardList/HelpBoardList";
import FriendBoardList from "../BoardList/FriendBoardList";
import { Select, Space } from 'antd';
import {useTranslation} from "react-i18next";
import ImgSlider from "./ImgSlider";

const Home = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    const [activeTab, setActiveTab] = useState('total'); //컴포넌트 선택
    const { t} = useTranslation();

    const getToken = () => {
        return localStorage.getItem('accessToken'); // 로컬 스토리지에서 토큰 가져옴
    };

    useEffect(() => {
        const token = getToken();
        setIsLogin(!!token); // 토큰이 존재하면 true, 없으면 false로 설정
    }, []);

    // 전체/일상/도움 선택
    const renderTabContent = () => {
        switch (activeTab) {
            case 'total':
                return (
                    <div>
                        <TotalBoardList />
                    </div>
                );
            case 'daily':
                return (
                    <div>
                        <DailyBoardList />
                    </div>
                );
            case 'help':
                return (
                    <div>
                        <HelpBoardList />
                    </div>
                );
            case 'friend':
                return (
                    <div>
                        <FriendBoardList/>
                    </div>
                )
            default:
                return null;
        }
    };

    return (
        <div className="home-layout">
            <Header />
            <ImgSlider />
            <div className="home-nav-layout">
                <div className="navbar">
                    <span>
                        <ul className="nav nav-underline nav-tab">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'total' ? 'active' : ''}`} style={{color: "black"}}
                                        onClick={() => setActiveTab('total')}>{t(`nav.전체`)}</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`} style={{color: "black"}}
                                        onClick={() => setActiveTab('daily')}>{t(`nav.일상`)}</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'help' ? 'active' : ''}`} style={{color: "black"}}
                                        onClick={() => setActiveTab('help')}>{t(`nav.도움`)}</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'friend' ? 'active' : ''}`} style={{color: "black"}}
                                        onClick={() => setActiveTab('friend')}>{t(`nav.친구`)}</button>
                            </li>
                        </ul>
                    </span>

                    <span>
                        <span className="select-style">
                            <Select
                                defaultValue="default"
                                style={{
                                    width: 100,
                                }}
                                options={[
                                    {
                                        value: 'default',
                                        label: t('sort.최신순'),
                                    },
                                    {
                                        value: 'viewCount',
                                        label: t('sort.조회순'),
                                    },
                                    {
                                        value: 'likeCount',
                                        label: t('sort.좋아요순')
                                    },
                                    {
                                        value: 'commentCount',
                                        label: t('sort.댓글순')
                                    },
                                ]}
                            />
                        </span>

                        {isLogin ? (
                            <button className="write-button" onClick={() => {
                                // navigate("/add-board", {state : {from : location.pathname}});
                                navigate("/post/new?type=post")
                            }}>
                                {t(`nav.글쓰기`)}
                            </button>
                        ) : (
                            <></>
                        )}
                    </span>
                </div>
            </div>
            <div className="home-content-layout">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Home;