"""
Script de teste para verificar a funcionalidade de check-in com WebSocket
"""
import asyncio
import websockets
import json
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def test_websocket_connection(inscricao_id):
    """
    Testa a conexão WebSocket para uma inscrição específica
    """
    uri = f"ws://localhost:8000/ws/checkin/{inscricao_id}/"

    print(f"🔌 Conectando ao WebSocket: {uri}")

    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Conexão WebSocket estabelecida com sucesso!")
            print("⏳ Aguardando mensagens de check-in...")

            # Aguardar mensagens
            while True:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=60.0)
                    data = json.loads(message)

                    print("\n📨 Mensagem recebida:")
                    print(json.dumps(data, indent=2, ensure_ascii=False))

                    if data.get('type') == 'checkin_update':
                        print("\n🎉 Check-in realizado!")
                        checkin_data = data.get('data', {})
                        print(f"   Participante: {checkin_data.get('participante')}")
                        print(f"   Evento: {checkin_data.get('evento')}")
                        print(f"   Data: {checkin_data.get('data_checkin')}")

                except asyncio.TimeoutError:
                    print("⏱️  Timeout - Nenhuma mensagem recebida em 60 segundos")
                    print("   Continuando a aguardar...")

    except websockets.exceptions.WebSocketException as e:
        print(f"❌ Erro na conexão WebSocket: {e}")
    except KeyboardInterrupt:
        print("\n⚠️  Conexão interrompida pelo usuário")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")


def main():
    """
    Função principal
    """
    print("=" * 60)
    print("   TESTE DE WEBSOCKET - CHECK-IN")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("\n❌ Uso incorreto!")
        print("   python test_checkin_websocket.py <inscricao_id>")
        print("\nExemplo:")
        print("   python test_checkin_websocket.py 12345678-1234-5678-1234-567812345678")
        sys.exit(1)

    inscricao_id = sys.argv[1]
    print(f"\n📋 ID da Inscrição: {inscricao_id}")
    print("\n💡 Dica: Execute o check-in pelo scanner ou API para ver a atualização em tempo real")
    print("   Endpoint: POST /api/checkin/{inscricao_id}/")
    print("\n" + "=" * 60 + "\n")

    # Executar teste
    asyncio.run(test_websocket_connection(inscricao_id))


if __name__ == "__main__":
    main()

