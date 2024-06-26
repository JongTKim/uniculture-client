import React, { useEffect, useState } from 'react'
import FriendList from '../../pages/Profile/components/FriendList';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from "axios";
import api from "../../pages/api";

export default function CreateChat({modal, createChat}) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    //검색
    const [searchInput, setSearchInput] = useState(null); // 검색창 값
    const [friendList, setFriendList] = useState([]); //친구 목록
    const [selectedUser, setSelectedUser] = useState([]); // 선택된 사용자 정보
    const [isChatButtonDisabled, setIsChatButtonDisabled] = useState(true); // 채팅 버튼 비활성화 여부
    
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
    };

    // 검색
    const searchFriend = async () => {
        try {
            console.log("채팅방 만들기 > 친구 검색");
            const token = getToken();

            let Query= searchInput ? `nickname=${searchInput}&` : '';

            if(Query){
                const response = await api.get(`/api/auth/friend?${Query}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if(response.status === 200){
                    setFriendList(response.data);
                }
            }
            else {setFriendList(null);}
        } catch (error) {
            errorModal(error);
        }
    };

    //검색 내용 바뀌면 실행
    useEffect(() => {
        const handler = setTimeout(() => {
            searchFriend();
        }, 500); // 사용자 입력이 멈춘 후 1초 뒤에 실행

        return () => {
            clearTimeout(handler); // timeout 취소
        };
    }, [searchInput]);

    // FriendList 컴포넌트에서 사용자를 선택했을 때 호출될 함수
    const handleUserSelect = (userInfo) => {

        console.log("userInfo : " + userInfo);
        // 기존 selectedUser 배열을 복제하여 새로운 배열을 생성
        const updatedSelectedUser = [...selectedUser];
        // 선택된 사용자 정보가 이미 배열에 있는지 확인
        const index = updatedSelectedUser.findIndex(user => user === userInfo);
        // 선택된 사용자 정보가 이미 배열에 있으면 제거하고, 없으면 추가
        if (index !== -1) {
            // 배열에서 해당 사용자 정보를 제거
            updatedSelectedUser.splice(index, 1);
        } else {
            // 배열에 사용자 정보를 추가
            updatedSelectedUser.push(userInfo);
        }
        // 새로운 배열을 selectedUser state에 저장
        setSelectedUser(updatedSelectedUser);
        // 선택된 사용자가 있으면 채팅 버튼 활성화, 없으면 비활성화
        setIsChatButtonDisabled(updatedSelectedUser.length === 0);
    };

    useEffect(() => {
        console.log("selectedUser : " + selectedUser);
    }, [selectedUser]);

    return (
        <div className="modal fade show" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content" style={{height:"450px"}}>
                    <div className="modal-header" style={{width: "100%", justifyContent: "normal"}}>
                        <div className="modal-title" style={{fontWeight: "bold"}}>{t('createChat.title')}</div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={modal}></button>
                    </div>
                    <div style={{display: "flex", width: "100%", borderBottom: "1px solid #E0E0E0", padding: "10px"}}>
                        <span style={{fontWeight: "bold"}}>{t('createChat.subTitle')}</span>
                        <input 
                            style={{flex: 1, border: 0, padding: "0px 10px 0px 10px", outline: 'none'}}
                            placeholder={t('createChat.searchPlaceholder')}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <div className="modal-body" style={{width: "90%", overflowY: "auto"}}>
                        {friendList?.length > 0 ? (
                            friendList.map((friend) => (
                                <FriendList key={friend.id} userInfo={friend} action="createChat" onUserSelect={handleUserSelect}/>
                            ))
                        ) : (
                            <div style={{fontSize: "14px", color: "#737373"}}>{t('createChat.noAccount')}</div>
                        )}
                    </div>
                    
                    <div className="modal-footer" style={{width: "100%"}}>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" style={{width: "100%"}} disabled={isChatButtonDisabled} onClick={()=>{createChat(selectedUser); modal();}}>{t('createChat.chatting')}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
