import React, {useCallback, useEffect, useState} from 'react';
import type {Node} from 'react';
import {Buffer} from 'buffer';
global.Buffer = global.Buffer || Buffer;

import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {SolidoSDK, getStakeApy, TX_STAGE} from '@lidofinance/solido-sdk';
import {Connection} from '@solana/web3.js';
import {ConnectionProvider} from '@solana/wallet-adapter-react';
import {
  Appbar,
  Provider as PaperProvider,
  Text,
  Card,
  Paragraph,
  Divider,
  TextInput,
  Switch,
} from 'react-native-paper';

import ConnectButton from './components/ConnectButton';
import useAuthorization from './components/useAuthorization';
import useAccountBalance from './components/useAccountBalance';
import StakeButton from './components/StakeButton';
import TxStateModal from './components/TxStateModal';
import LidoLogo from './components/Logo';

const styles = StyleSheet.create({
  sectionContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const Section = ({label, value}): Node => {
  return (
    <View style={styles.sectionContainer}>
      <Text variant="bodyMedium" style={{color: '#273852'}}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{color: '#273852'}}>
        {value}
      </Text>
    </View>
  );
};

const rpcEndpoint = 'https://api.testnet.solana.com/';

const connection = new Connection(rpcEndpoint);
const sdk = new SolidoSDK('testnet', connection);

const App: () => Node = () => {
  const [lidoStats, setLidoStats] = useState({
    apy: 8.72,
    totalStaked: 0,
    stakers: 0,
    marketCap: 0,
  });
  const [transactionInfo, setTransactionInfo] = useState({
    exchangeRate: 1,
    transactionCost: {
      costInSol: 0.000005,
      costInUsd: 0.00006,
    },
    stakingRewardsFee: '10%',
  });
  const [stakeAmount, setStakeAmount] = useState(0);
  const {selectedAccount} = useAuthorization();

  const [txStage, setTxStage] = useState({
    stage: TX_STAGE.IDLE,
    transactionHash: '',
  });
  const [txModalVisible, setTxModalVisible] = useState(false);

  const {balance, stSolBalance} = useAccountBalance({
    sdk,
    stakeAmount,
    txStage: txStage.stage,
  });

  const [isSwitchOn, setIsSwitchOn] = React.useState(false);
  const onToggleSwitch = () => {
    setStakeAmount('');
    setIsSwitchOn(!isSwitchOn);
  };

  useEffect(() => {
    getStakeApy().then(({max}) => {
      setLidoStats(prevState => ({
        ...prevState,
        apy: max.apy,
      }));
    });

    sdk.getTransactionInfo(1).then(txInfo => {
      setTransactionInfo({
        ...txInfo,
        exchangeRate: txInfo.exchangeRate.value,
        stakingRewardsFee: txInfo.stakingRewardsFee.fee,
      });
    });

    sdk.getStakersCount().then(({value: stakers}) => {
      setLidoStats(prevState => ({...prevState, stakers}));
    });

    sdk.getTotalStaked().then(totalStaked => {
      sdk.getMarketCap(totalStaked).then(marketCap => {
        setLidoStats(prevState => ({
          ...prevState,
          totalStaked,
          marketCap,
        }));
      });
    });
  }, []);

  const backgroundStyle = {
    backgroundColor: Colors.lighter,
    height: '100%',
  };

  const onChangeStakeInput = useCallback(text => {
    if (!isNaN(+text)) {
      setStakeAmount(+text);
    }
  }, []);

  const hideModal = useCallback(() => {
    setStakeAmount('');
    setTxStage(TX_STAGE.IDLE);
    setTxModalVisible(false);
  });

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Appbar.Header
        mode="center-aligned"
        elevated
        style={{backgroundColor: Colors.lighter}}>
        <View
          style={{
            paddingLeft: 12,
            paddingRight: 12,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}>
          <LidoLogo />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={{color: 'green', marginLeft: 6}}>Testnet</Text>
          </View>
        </View>
      </Appbar.Header>

      <TxStateModal
        visible={txModalVisible}
        transactionHash={txStage.transactionHash}
        stakeAmount={stakeAmount}
        stage={txStage.stage}
        onDismiss={hideModal}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={{backgroundColor: Colors.white, padding: 12}}>
          <Text
            variant="headlineLarge"
            style={{
              fontWeight: '800',
              textAlign: 'center',
              paddingTop: 12,
              color: '#273852',
            }}>
            {isSwitchOn ? 'Un' : ''}Stake Solana
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              textAlign: 'center',
              color: '#7a8aa0',
              marginBottom: 24,
            }}>
            Stake SOL and receive stSOL while staking
          </Text>

          <Card style={{padding: 12}}>
            <Card.Content>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View>
                  <Text variant="bodyMedium">SOL Balance</Text>
                  <Paragraph>
                    <Text variant="titleLarge" style={{fontWeight: '900'}}>
                      {balance} SOL
                    </Text>
                  </Paragraph>
                </View>

                <View>
                  <Switch
                    color="#00a3ff"
                    value={isSwitchOn}
                    onValueChange={onToggleSwitch}
                  />
                </View>
              </View>

              <Divider style={{marginBottom: 12, marginTop: 6}} />

              <Text variant="bodyMedium">stSOL Balance</Text>
              <Paragraph>
                <Text variant="titleLarge" style={{fontWeight: '900'}}>
                  {stSolBalance} stSOL
                </Text>
              </Paragraph>
            </Card.Content>

            <Card
              style={{
                margin: -13,
                marginTop: 12,
                backgroundColor: '#fff',
                padding: 12,
              }}>
              <Card.Content>
                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  label="Stake amount"
                  outlineColor="#d1d8df"
                  textColor="#273852"
                  activeOutlineColor="#00a3ff"
                  onChangeText={onChangeStakeInput}
                  disabled={isSwitchOn}
                  value={stakeAmount}
                  style={{backgroundColor: '#fff', marginBottom: 12}}
                />

                {selectedAccount ? (
                  <StakeButton
                    sdk={sdk}
                    setTxStage={setTxStage}
                    setTxModalVisible={setTxModalVisible}
                    stakeAmount={stakeAmount}
                    disabled={isSwitchOn}
                  />
                ) : (
                  <ConnectButton />
                )}

                <View style={{marginTop: 24}}>
                  <Section
                    label="You will receive:"
                    value={`~${+(
                      (stakeAmount || 0) * transactionInfo.exchangeRate
                    ).toFixed(4)} stSOL`}
                  />
                  <Section
                    label="Exchange rate:"
                    value={`1 SOL = ${transactionInfo.exchangeRate} stSOL`}
                  />
                  <Section
                    label="Transaction cost:"
                    value={`~${transactionInfo.transactionCost.costInSol} SOL ($${transactionInfo.transactionCost.costInUsd})`}
                  />
                  <Section
                    label="Staking rewards fee:"
                    value={transactionInfo.stakingRewardsFee}
                  />
                </View>
              </Card.Content>
            </Card>
          </Card>

          <Text
            variant="titleLarge"
            style={{
              fontWeight: '800',
              paddingTop: 24,
              color: '#273852',
            }}>
            Lido statistics
          </Text>
          <Card style={{padding: 12, marginTop: 12, backgroundColor: '#fff'}}>
            <Card.Content>
              <Section
                label="Annual percentage yield:"
                value={`${lidoStats.apy.toFixed(2)}%`}
              />
              <Section
                label="Total staked with Lido:"
                value={`${lidoStats.totalStaked} SOL`}
              />
              <Section label="Stakers" value={lidoStats.stakers} />
              <Section label="MarketCap:" value={`$${lidoStats.marketCap}`} />
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default () => {
  return (
    <PaperProvider>
      <ConnectionProvider endpoint={rpcEndpoint}>
        <App />
      </ConnectionProvider>
    </PaperProvider>
  );
};
