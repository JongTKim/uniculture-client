import React, {useEffect, useRef, useState} from 'react'
import Layout from '../../components/Layout'
import { TbAdjustmentsHorizontal, TbSearch } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import FriendCard from './components/FriendCard';
import { Badge, Input } from "antd";
import { AiOutlineBell } from "react-icons/ai";
import Pagination from '@mui/material/Pagination';
import { TbReload } from "react-icons/tb";
import styles from './Friend.module.css';
import RequestModal from '../../components/Friend/RequestModal';
import Filter from './components/Filter';
import {useTranslation} from "react-i18next";
import Recommend from './Recommend';
import Swal from 'sweetalert2';
import api from "../api";

export default function Friend() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('myFriends'); //컴포넌트 선택
    const [friendList, setFriendList] = useState([]); //친구 목록
    const [recommendFriendList, setRecommendFriendList] = useState([]); //추천 친구 목록
    const [recommendCount, setRecommendCount] = useState(null); //추천 친구 새로고침 잔여 횟수
    const [receivedRequestsNum, setReceivedRequestsNum] = useState(0); // 받은 요청 수
    
    //검색
    const [searchInput, setSearchInput] = useState(null); // 검색창 값
    const [isLoading, setIsLoading] = useState(false); //검색 로딩 상태

    //필터
    const [showFilter, setShowFilter] = useState(false); //필터 div 보이기
    
    //select
    const [selectGender, setSelectGender] = useState("ge"); //선택 성별
    const [selectMina, setSelectMina] = useState('0'); //선택 최소나이
    const [selectMaxa, setSelectMaxa] = useState('100'); //선택 최대나이
    const [selectCL, setSelectCL] = useState("cl"); //선택 사용언어
    const [selectWL, setSelectWL] = useState("wl"); //선택 학습언어
    const [selectHb, setSelectHb] = useState("hb"); //선택 관심사

    //pagination
    const [pageCount, setPageCount] = useState(0); //전체 페이지 수
    const [currentPage, setCurrentPage] = useState(0); //현재 페이지

    //친구 신청 모달창
    const [showRequests, setShowRequests] = useState(false);
    const initialRender = useRef(true);

    useEffect(()=> {

    }, [showRequests])

    // 로그인 후 저장된 토큰 가져오는 함수
    const getToken = () => {
        return localStorage.getItem('accessToken'); // 쿠키 또는 로컬 스토리지에서 토큰을 가져옴
    };

    const errorModal = (error) => {
        if(error.response.status === 401) {
            Swal.fire({
                icon: "warning",
                title: `<div style='font-size: 21px; margin-bottom: 10px;'>${t('loginWarning.title')}</div>`,
                confirmButtonColor: "#8BC765",
                confirmButtonText: t('loginWarning.confirmButton'),
            }).then(() => {
                navigate("/sign-in");
            })
        }
        else {
            Swal.fire({
                icon: "warning",
                title: `<div style='font-size: 21px; margin-bottom: 10px;'>${t('serverError.title')}</div>`,
                confirmButtonColor: "#8BC765",
                confirmButtonText: t('serverError.confirmButton'),
            })
        }
    }

    // 친구 목록 불러오기, 검색
    const fetchFriendList = async (page) => {
        try {
            console.log("친구 목록 불러오기");
            const token = getToken();

            let Query = '';
            if(searchInput) Query += `&name=${searchInput}`;
            if (selectGender !== 'ge') Query += `&ge=${selectGender}`;
            if (selectMina !=='0' || selectMaxa !== '100' ) Query += `&mina=${selectMina}&maxa=${selectMaxa}`;
            if (selectCL !== "cl") Query += `&cl=${selectCL}`;
            if (selectWL !== "wl") Query += `&wl=${selectWL}`;
            if (selectHb !== "hb") Query += `&hb=${selectHb}`;

            const response = await api.get(`/api/auth/friend/search?page=${page}&size=6${Query}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if(response.status === 200){
                setFriendList(response.data.content);
                setPageCount(Math.ceil(response.data.totalElements / 6));
            }
        } catch (error) {
            errorModal(error);
        }
    };

    // 추천 친구 목록 불러오기
    const fetchRecommendFriend = async () => {
        try {
            console.log("추천 친구 목록 불러오기");
            const token = getToken();

            const response = await api.get(`/api/auth/friend/recommend`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if(response.status === 200){
                setRecommendFriendList(response.data);
                console.log("추천 친구 : " + JSON.stringify(response.data));
                console.log("추천 친구 수: " + response.data.length);
            }
        } catch (error) {
            errorModal(error);
        }
    };

    // 추천 친구 목록 다시 불러오기
    const recommendFriendReload = async () => {
        try {
            const token = getToken();

            const response = await api.post(`/api/auth/friend/recommend`, null,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if(response.status === 200){
                setRecommendFriendList(response.data);
                recommendFriendCount();
                console.log("추천 친구 : " + JSON.stringify(response.data));
            }
        } catch (error) {
            errorModal(error);
        }
    };

    // 추천 친구 새로고침 잔여 횟수
    const recommendFriendCount = async () => {
        try {
            const token = getToken();

            const response = await api.get(`/api/auth/friend/recommend/count`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if(response.status === 200){
                setRecommendCount(response.data);
            }
        } catch (error) {
            errorModal(error);
        }
    };

    //검색 내용 바뀌면 실행
    useEffect(() => {
        if(activeTab==='myFriends') {
            fetchFriendList(0); //친구목록(페이지1) 불러오기
            fetchReceivedRequests(); //받은 친구 요청 수 불러오기
        }
        else fetchRecommendFriend(0); //추천친구(페이지1) 불러오기
    }, [activeTab]);

    //검색 내용 바뀌면 실행
    useEffect(() => {
        if(searchInput !== null){
            setIsLoading(true); // 로딩 상태를 활성화합니다.
            const timerId = setTimeout(() => {
                setCurrentPage(0);
                fetchFriendList(0).then(() => {
                    setIsLoading(false); // fetchFriendList가 완료되면 로딩 상태를 비활성화합니다.
                });
            }, 800);
            return () => {
                clearTimeout(timerId);
            };
        }
    }, [searchInput]);

    // 페이지 변경 시 해당 상태를 업데이트하는 함수
    const changePage = (event) => {
        const page = event.target.outerText - 1;
        setCurrentPage(page); //현재 페이지
        fetchFriendList(page);
    }
    
    //내 친구/추천 친구 선택
    const renderTabContent = () => {
        switch (activeTab) {
            case 'myFriends':
                return (
                    <div style={{marginTop: "30px"}}>
                        {friendList.length > 0 ? (
                            <div className={styles.myfrineds}>
                                {friendList.map((friend) => (
                                    <div key={friend.id} style={{ width: "350px", marginBottom: "20px"}}>
                                        <FriendCard key={friend.id} userInfo={friend} deleteFriend={deleteFriend} cl={selectCL} wl={selectWL} hb={selectHb} sendMessage={sendMessage}/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                {selectGender === 'ge' && selectMina ==='0' && selectMaxa === '100' && selectCL === "cl" && selectWL === "wl" && selectHb === "hb" ? (
                                    <p>{t('friend.addFriendsPrompt')}</p>
                                ) : (
                                    <p>{t('friend.noResults')}</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'recommend':
                return (
                    <Recommend recommendFriendList={recommendFriendList} sendMessage={sendMessage} />
                );
        }
    };

    //채팅 보내기
    const sendMessage = async (otherInfo) => {
        try {
            const token = getToken(); // 토큰 가져오기

            const response = await api.get(`/api/auth/room/duo?toId=${otherInfo.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if(response.status === 200){
                console.log(response);
                navigate(`/chat/${response.data.chatRoomId}`);
            }
        } catch (error) {
            errorModal(error);
        }
    }

    // 친구 삭제
    const  deleteFriend = async (friendInfo) => {
        try {
            const token = getToken();

            const response = await api.delete('/api/auth/friend', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    targetId: friendInfo.id
                }
            });
            
            if(response.status === 200){
                setCurrentPage(0);
                fetchFriendList(0);
            }
        } catch (error) {
            errorModal(error);
        }
    };

    // 받은 친구 신청 목록 불러오기
    const fetchReceivedRequests = async () => {
        try {
            const token = getToken();

            const response = await api.get('/api/auth/friend-requests/receive', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if(response.status === 200){
                setReceivedRequestsNum(response.data.length);
            }
        } catch (error) {
            errorModal(error);
        }
    };

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
        } else if (!showRequests) {
            fetchFriendList(currentPage);
            fetchReceivedRequests();
        }
    }, [showRequests]);


    const handleReceivedRequestsNum = (type) => {
        if(type === "add") setReceivedRequestsNum(receivedRequestsNum + 1);
        else if( type === "subtract") setReceivedRequestsNum(receivedRequestsNum - 1);
    }

    //필터 선택
    const handleSelect = (value, select) => {
        if(select === "gender") setSelectGender(value);
        else if(select === "mina") setSelectMina(value);
        else if(select === "maxa") setSelectMaxa(value);
        else if(select === "cl") setSelectCL(value);
        else if(select === "wl") setSelectWL(value);
        else if(select === "hobby") setSelectHb(value);
    }

    //필터내용 바뀌면 실행
    useEffect(() => {
        if(showFilter){
            setCurrentPage(0);
            fetchFriendList(0);
        }
    }, [selectGender, selectMina, selectMaxa, selectCL, selectWL, selectHb]);

    //필터 없애기
    const resetFilter = (bool) => {
        setSelectGender("ge");
        setSelectMina('0');
        setSelectMaxa('100');
        setSelectCL("cl");
        setSelectWL("wl");
        setSelectHb("hb");

        if(bool==="false") setShowFilter(false);

        setCurrentPage(0);
        if(activeTab==="myFriends") fetchFriendList(0);
        else fetchRecommendFriend(0);
    }

    return (
        <Layout>
            <div style={{display:"flex", justifyContent: "space-between", alignItems: "center"}}>
                <div style={{display:"flex", alignItems: "center"}}>
                    <div className="navDiv">
                        <ul className="nav nav-underline nav-tab">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'myFriends' ? 'active' : ''}`} style={{color: "black"}}
                                        onClick={() => {setActiveTab('myFriends'); resetFilter("false");}}>
                                        {t('friend.내 친구')}
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'recommend' ? 'active' : ''}`} style={{color: "black"}}
                                       onClick={() => {setActiveTab('recommend'); setSearchInput(null); resetFilter("false"); recommendFriendCount();}}>
                                       {t('friend.추천 친구')}
                                    </button>
                            </li>
                        </ul>   
                    </div>
                    
                    {activeTab === 'myFriends' && (
                        <div style={{marginLeft: "20px"}}>
                            <Input
                                placeholder="Search for friends"
                                prefix={<TbSearch style={{ color: 'rgba(0,0,0,.25)' }} />}
                                style={{width: 300, minWidth: 100}}
                                onChange={(e) => setSearchInput(e.target.value)}
                                suffix={
                                    // isLoading 상태에 따라 로딩 이미지를 표시합니다.
                                    isLoading && (
                                        <img
                                            src={require('../../assets/Spinner@2x-1.0s-200px-200px.gif')}
                                            alt="Loading..."
                                            style={{
                                                width: '30px', // 이미지의 크기를 조정할 수 있습니다.
                                                height: '30px', // 이미지의 크기를 조정할 수 있습니다.
                                            }}
                                        />
                                    )
                                }
                            /> 
                        </div>
                    )}

                    {activeTab==='myFriends' && <div style={{fontSize: "25px", marginLeft: "20px", paddingBottom: "5px"}} onClick={()=>{setShowFilter(!showFilter); }}><TbAdjustmentsHorizontal /></div>}
                
                </div>

                <div style={{display: "flex"}}>
                    {activeTab=="recommend" && 
                        <>
                            <span 
                                style={{marginRight: "2px", color: recommendCount > 0 ? "black" : "#737373"}} 
                                onClick={recommendCount > 0 ? recommendFriendReload : null}>
                                    <TbReload size={25}/>

                            </span> 
                            {recommendCount > 0 ? (
                                <span style={{marginRight: "10px", color: "#737373", fontSize: "11px", alignSelf: "flex-end"}} >( {recommendCount} / 3)</span>
                            ) : (
                                <span style={{marginRight: "10px", color: "#737373", fontSize: "11px", alignSelf: "flex-end"}} >매일 00시에 초기화됩니다.</span>
                            )}
                        </>
                    }
                    
                    <Badge count={receivedRequestsNum} size="small" overflowCount={10}>
                        <AiOutlineBell size={25} onClick={() => {
                            setShowRequests(true);
                        }}/>
                    </Badge>              
                </div>
            </div>

            {/* 친구 필터 */}
            {showFilter && (
                <Filter handleSelect={handleSelect} resetFilter={resetFilter} ge={selectGender} mina={selectMina} maxa={selectMaxa} cl={selectCL} wl={selectWL} hb={selectHb}/>
            )}

            {renderTabContent()}
            {friendList.length > 0 && activeTab === 'myFriends' && (
                <div style={{display: "flex", justifyContent: "center", marginTop: "30px", width: "100%" }}>
                    <Pagination page={currentPage + 1} count={pageCount}  defaultPage={1} onChange={changePage} showFirstButton showLastButton />
                </div>
            )}

            {/* 친구 신청 모달창 */}
            {showRequests && (
                <RequestModal modal={setShowRequests} handleReceivedRequestsNum={handleReceivedRequestsNum} />
            )}

        </Layout>
    )
}