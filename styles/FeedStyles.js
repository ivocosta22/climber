import styled from 'styled-components'

export const Container = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 0px;
    background-color: #fff;
`;

export const ContainerDark = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 0px;
    background-color: #000;
`;

export const Card = styled.View`
    width: 350px;
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
`;

export const CardDark = styled.View`
    background-color: #222;
    width: 350px;
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
`;

export const UserInfo = styled.View`
    flex-direction: row;
    justify-content: flex-start;
    padding: 15px;
`;

export const UserImg = styled.Image`
    width: 50px;
    height: 50px;
    border-radius: 25px;
`;

export const UserInfoText = styled.View`
    flex-direction: column;
    justify-content: center;
    margin-left: 10px;
`;

export const PostTime = styled.Text`
    font-size: 12px;
    color: #333;
`;

export const PostTimeDark = styled.Text`
    font-size: 12px;
    color: #999;
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

export const PostText = styled.Text`
    font-size: 14px;
    padding-left: 15px;
    padding-right: 15px;
    margin-bottom: 15px;
`;

export const PostTextDark = styled.Text`
    font-size: 14px;
    padding-left: 15px;
    padding-right: 15px;
    margin-bottom: 15px;
    color: #fff;
`;

export const PostImg = styled.Image`
    width: 100%;
    height: 250px;
`;

export const InteractionWrapper = styled.View`
    flex-direction: row;
    justify-content: space-around;
    padding: 15px;
`;

export const Interaction = styled.TouchableOpacity`
    flex-direction: row;
    justify-content: center;
    border-radius: 5px;
    padding: 2px 5px;
    color: ${props => props.active ? '#0782F9' : 'transparent'}
`;

export const InteractionText = styled.Text`
    font-size: 12px;
    font-weight: bold;
    color: #333;
    margin-top: 5px;
    margin-left: 5px;
    color: ${props => props.active ? '#0782F9' : '#333'}
`;

export const InteractionTextDark = styled.Text`
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    margin-top: 5px;
    margin-left: 5px;
    color: ${props => props.active ? '#0782F9' : '#fff'}
`;

export const PostDivider = styled.View`
    border-bottom-color: #dddddd;
    border-bottom-width: 1px;
    width: 92%;
    align-self: center;
    margin-top: 15px;
`;