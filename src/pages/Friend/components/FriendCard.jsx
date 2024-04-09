import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import PercentBar from '../../../components/PercentBar/PercentBar';
import Swal from 'sweetalert2';
import { Card } from "antd";
import { SlBubbles, SlClose } from "react-icons/sl";
import { GiMale, GiFemale } from "react-icons/gi";

export default function FriendCard({userInfo, deleteFriend, cl, wl, hb}) {
    const navigate = useNavigate();
    const [canLanguage, setCanLanguage] = useState(); // Card에 보이는 cl
    const [CLList, setCLList] = useState(); // 사용 언어 능숙도 높은순
    const [wantLanguage, setWantLanguage] = useState(); // Card에 보이는 wl
    const [WLList, setWLList] = useState(); // 학습 언어 능숙도 높은순

    const [showAllInfo, setShowAllInfo] = useState(false); // 모든 정보 보기 여부
    const [showAllLanguage, setShowAllLanguage] = useState(false);
    const [activeTab2, setActiveTab2] = useState('can');

    //친구 프로필로 이동
    const handleProfile = () => {
        navigate(`/profile/${userInfo.nickname}`);
    }

    useEffect(() => {
        // 사용 언어 배열로 변환하여 업데이트한 후 능숙도가 높은 언어 구하기
        const canLanguagesArray = Object.entries(userInfo.canLanguages).map(([language, level]) => ({ language, level }));
        const sortedCanLanguagesArray = [...canLanguagesArray].sort((a, b) => b.level - a.level);
        setCLList(sortedCanLanguagesArray);

        //cl 값이 있으면 cl이 Card에 보이도록 설정
        if (sortedCanLanguagesArray.some(lang => lang.language === cl)) {
            const languageInfo = sortedCanLanguagesArray.find(lang => lang.language === cl);
            setCanLanguage(languageInfo);
        }
        else setCanLanguage(sortedCanLanguagesArray[0]);

        // 학습 언어 배열로 변환하여 업데이트한 후 능숙도가 가장 높은 언어 구하기
        const wantLanguagesArray = Object.entries(userInfo.wantLanguages).map(([language, level]) => ({ language, level }));
        const sortedWantLanguagesArray = [...wantLanguagesArray].sort((a, b) => b.level - a.level);
        setWLList(sortedWantLanguagesArray);
        
        //wl 값이 있으면 wl이 Card에 보이도록 설정
        if (sortedWantLanguagesArray.some(lang => lang.language === wl)) {
            const languageInfo = sortedWantLanguagesArray.find(lang => lang.language === wl);
            setWantLanguage(languageInfo);
        }
        else setWantLanguage(sortedWantLanguagesArray[0]);

       // 취미 중에서 hb와 동일한 항목을 맨 앞으로 이동
        if (hb && userInfo.hobbies && userInfo.hobbies.includes(hb)) {
            const updatedHobbies = [hb, ...userInfo.hobbies.filter(hobby => hobby !== hb)];
            userInfo.hobbies = updatedHobbies;
        }
    }, [userInfo, cl, wl, hb]);

    // 언어 모달창 : 선택된 탭에 따라 해당 목록을 표시하는 함수
    const renderTabContent2 = () => {
        switch (activeTab2) {
            case 'can':
                return (
                    <div>
                        {CLList && CLList.map((language, index) => (
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E0E0E0', padding: '10px' }}>
                                <PercentBar key={index} language={language.language} level={language.level} color={"blue"}/>
                            </div>
                        ))}
                    </div>
                );
            case 'want':
                return (
                    <div>
                        {WLList && WLList.map((language, index) => (
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E0E0E0', padding: '10px' }}>
                                <PercentBar key={index} language={language.language} level={language.level} color={"red"}/>
                            </div>
                        ))}
                    </div>
                );
            default:
                return ;
        }
    };

    //친구 삭제
    const handleDeleteFriend = () => {
        Swal.fire({
            title: "정말 이 친구를 삭제하시겠어요?",
            text: "삭제 시 해당 친구가 친구 목록에서 사라집니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "삭제",
            cancelButtonText: "취소"
        }).then((result) => {
            if (result.isConfirmed) {
                // 친구 삭제하는 함수 호출
                deleteFriend(userInfo);
            }
        });
    }
    
    return (
        <Card 
            title={
                <div style={{ display: 'flex', alignItems:"center", justifyContent: "space-between"}}>
                    <div style={{ display: 'flex', alignItems:"center"}}>
                        {/* 프로필 사진 */}
                        <div style={{marginRight:"10px"}} onClick={handleProfile}>
                            <img
                                src={userInfo?.profileImage ? userInfo.profileImage : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                alt="profile"
                                style={{width:"40px", borderRadius: "50%"}}
                            />
                        </div>

                        {/* 닉네임 */}
                        <div style={{minWidth: "80px", whiteSpace: "pre-wrap"}} onClick={handleProfile}>{userInfo.nickname}</div>

                        {/* 성별, 나이 */}
                        <div style={{fontWeight:"normal", display:"flex", marginLeft:"10px"}}>
                            {userInfo?.gender === "MAN" ? (
                                    <GiMale color='blue' size={20} />
                            ):(
                                <GiFemale color='red' size={20}/>
                            )}
                            <div style={{fontSize:"13px", marginLeft:"3px"}}>{userInfo.age}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems:"center"}}>
                        {/* 채팅 보내기 */}
                        <div style={{marginLeft: "15px"}}><SlBubbles size={20}/></div>
                        {/* 친구 삭제 */}
                        {deleteFriend && <div style={{marginLeft: "15px"}} onClick={handleDeleteFriend}><SlClose size={20}/></div>}
                    </div>
                </div>
            }
        >   
            <div>
                {/* 소개 */}
                {userInfo?.introduce && 
                    <div style={{textAlign: "left", marginBottom: "15px"}}>
                        {userInfo?.introduce}
                    </div>
                }

                {/* 더보기 true/false */}
                {showAllInfo ? ( 
                    //더 보기
                    <div>
                        {CLList && 
                            <div style={{marginBottom: "15px"}}>
                                <div style={{fontWeight: "bold"}}>🌎 사용 언어</div>
                                {CLList && CLList.map((language, index) => (
                                    <div style={{ padding: '8px' }}>
                                        <PercentBar key={index} language={language.language} level={language.level} color={"blue"}/>
                                    </div>
                                ))}
                            </div>
                        }
                        
                        {WLList && 
                            <div style={{marginBottom: "15px"}}>
                                <div style={{fontWeight: "bold"}}>🌎 학습 언어</div>
                                {WLList.map((language, index) => (
                                    <div style={{ padding: '8px' }}>
                                        <PercentBar key={index} language={language.language} level={language.level} color={"red"}/>
                                    </div>
                                ))}
                            </div>
                        }

                        {userInfo.hobbies && 
                            <div style={{marginBottom: "20px"}}>
                                <div style={{fontWeight: "bold", marginBottom: "5px"}}>❤️ 관심사</div>
                                {userInfo.hobbies.map((hobby, index) => (
                                    <div
                                        key={index} 
                                        style={{ 
                                            display: "inline-block",
                                            borderRadius: "9px", 
                                            backgroundColor: hb === hobby ? "#C8DCA0" : "#e9ecef", 
                                            padding: "5px 10px",
                                            marginRight: "3px",
                                            marginTop: "5px"
                                        }}
                                    >
                                        # {hobby}
                                    </div>
                                ))}
                            </div>
                        }

                        <div onClick={()=> setShowAllInfo(false)} style={{ cursor: "pointer", marginTop: "10px", color: "blue" }}>
                            - 간략하게
                        </div>
                    </div>
                ) : (
                    //간략하게 보기
                    <div>
                        {/* 사용언어, 학습언어 */}
                        {canLanguage && <div style={{marginBottom: "15px"}}><PercentBar language={canLanguage.language} level={canLanguage.level} color={"blue"}/></div>}
                        {wantLanguage && <div style={{marginBottom: "15px"}}><PercentBar language={wantLanguage.language} level={wantLanguage.level} color={"red"}/></div>}

                        {userInfo.hobbies && userInfo.hobbies.slice(0, 4).map((hobby, index) => (
                            <div
                                key={index} 
                                style={{ 
                                    display: "inline-block",
                                    borderRadius: "9px", 
                                    backgroundColor: hb === hobby ? "#C8DCA0" : "#e9ecef", 
                                    padding: "5px 10px",
                                    marginRight: "3px",
                                    marginTop: "5px"
                                }}
                            >
                                # {hobby}
                            </div>
                        ))}
                        {( (CLList && CLList.length > 1) || (WLList && WLList.length > 1) || userInfo.hobbies.length > 4 )&& (
                            <div onClick={()=> setShowAllInfo(true)} style={{ cursor: "pointer", marginTop: "10px", color: "blue" }}>
                                + 더 보기
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 전체 사용, 학습 언어 보기 모달창 */}
            {showAllLanguage && (
                <div className="modal fade show" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content" style={{height:"450px"}}>
                                <ul className="nav nav-tabs">
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${activeTab2 === 'can' ? 'active' : ''}`} 
                                            style={{ width:"150px", backgroundColor: activeTab2 === 'can' ? '#B7DAA1' : 'white', color: "black"}}
                                            onClick={() => setActiveTab2('can')}
                                        >사용 언어</button>
                                    </li>
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${activeTab2 === 'want' ? 'active' : ''}`} 
                                            style={{ width:"150px", backgroundColor: activeTab2 === 'want' ? '#B7DAA1' : 'white', color: "black"}}
                                            onClick={() => setActiveTab2('want')}
                                        >학습 언어</button>
                                    </li>
                                </ul>

                            <div className="modal-body">
                                {renderTabContent2()}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => {setShowAllLanguage(false); setActiveTab2('can')}}>닫기</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}