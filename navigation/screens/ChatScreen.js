import * as React from 'react'
import { ScrollView } from 'react-native'
import SkeletonLoader from 'expo-skeleton-loader'

const ChatScreen = () => {
    return (
        <ScrollView style={[{flex: 1}]} contentContainerStyle={{alignItems: 'center'}}>
            <SkeletonLoader boneColor='#b6b6b6' highlightColor='#fff'>
                <SkeletonLoader.Container style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <SkeletonLoader.Item style={{width: 60, height: 60, borderRadius: 50}}/>
                    <SkeletonLoader.Item style={{marginLeft: 20}}>
                        <SkeletonLoader.Item style={{width: 120, height: 20, borderRadius: 4}}/>
                        <SkeletonLoader.Item style={{ marginTop: 6, width: 80, height: 20, borderRadius: 4}}/>
                    </SkeletonLoader.Item>
                </SkeletonLoader.Container>
                <SkeletonLoader.Item style={{marginTop: 10, marginBottom: 30}}>
                    <SkeletonLoader.Item style={{width: 300, height: 20, borderRadius: 4}} />
                    <SkeletonLoader.Item style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}} />
                    <SkeletonLoader.Item style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}} />
                </SkeletonLoader.Item>
            </SkeletonLoader>
            <SkeletonLoader boneColor='#b6b6b6' highlightColor='#fff'>
                <SkeletonLoader.Container style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <SkeletonLoader.Item style={{width: 60, height: 60, borderRadius: 50}}/>
                    <SkeletonLoader.Item style={{marginLeft: 20}}>
                        <SkeletonLoader.Item style={{width: 120, height: 20, borderRadius: 4}}/>
                        <SkeletonLoader.Item style={{ marginTop: 6, width: 80, height: 20, borderRadius: 4}}/>
                    </SkeletonLoader.Item>
                </SkeletonLoader.Container>
                <SkeletonLoader.Item style={{marginTop: 10, marginBottom: 30}}>
                    <SkeletonLoader.Item style={{width: 300, height: 20, borderRadius: 4}} />
                    <SkeletonLoader.Item style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}} />
                    <SkeletonLoader.Item style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}} />
                </SkeletonLoader.Item>
            </SkeletonLoader>
        </ScrollView>
    )
}

export default ChatScreen