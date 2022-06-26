import styled from 'styled-components'

export const Container = styled.View`
    flex: 1;
    padding-left: 20px;
    padding-right: 20px;
    align-items: center;
    background-color: #fff;
`;

export const ContainerDark = styled.View`
    flex: 1;
    padding-left: 20px;
    padding-right: 20px;
    align-items: center;
    background-color: #000;
`;

export const Card = styled.TouchableOpacity`
    width: 100%;
`;

export const UserInfo = styled.View`
    flex-direction: row;
    justify-content: space-between;
`;

export const UserImgWrapper = styled.View`
    padding-top: 15px;
    padding-bottom: 15px;
`;

export const UserImg = styled.Image`
    width: 50px;
    height: 50px;
    border-radius: 25px;
`;

export const TextSection = styled.View`
    flex-direction: column;
    justify-content: center;
    padding: 15px;
    padding-left: 0;
    margin-left: 10px;
    width: 300px;
`;

export const UserInfoText = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 5px;
`;

export const UserName = styled.Text`
    font-size: 14px;
    font-weight: bold;
`;

export const UserNameDark = styled.Text`
    font-size: 14px;
    font-weight: bold;
    color: #fff;
`;

export const PostTime = styled.Text`
    font-size: 12px;
    color: #666;
`;

export const PostTimeDark = styled.Text`
    font-size: 12px;
    color: #888;
`;

export const MessageText = styled.Text`
    font-size: 14px;
    color: #333;
`;

export const MessageTextDark = styled.Text`
    font-size: 14px;
    color: #bbb;
`;