import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function InstructionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Print & Play</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Before You Start:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm mb-4">
              <li>Add memorable 2-3 word event names to your photos</li>
              <li>Leave some blank for extra difficulty!</li>
              <li>Cards work best with 5-24 photos from different time periods</li>
            </ul>

            <h3 className="font-semibold mb-2">Printing Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Export your cards as PDF</li>
              <li>Print on regular letter-size paper (landscape orientation)</li>
              <li>Each page contains 5 tall cards in a row</li>
              <li>
                <strong>Fold first</strong> - Fold each card in half along the center line
              </li>
              <li>
                <strong>Then cut</strong> - Cut along the dotted lines (4 cuts per page)
              </li>
              <li>Use tape or glue stick on bottom edge to keep sides together</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Game Rules (Timeline):</h3>
            <div className="text-sm space-y-2">
              <p>
                <strong>Goal:</strong> Be the first player to correctly place all your cards!
              </p>

              <p>
                <strong>Setup:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Deal 4 cards to each player (year side hidden)</li>
                <li>Place one card in center with year showing</li>
                <li>Keep remaining cards as draw pile</li>
              </ul>

              <p>
                <strong>How to Play:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>On your turn, place one card where you think it belongs chronologically</li>
                <li>Flip to reveal the year - were you right?</li>
                <li>
                  <strong>Correct:</strong> Card stays, your turn ends
                </li>
                <li>
                  <strong>Wrong:</strong> Discard card and draw a new one
                </li>
              </ul>

              <p>
                <strong>Winning:</strong> First player to correctly place their last card wins!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-semibold mb-1">Pro Tips:</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Start with obvious dates (births, graduations) then add trickier ones</li>
            <li>Mix family photos with historical events for extra challenge</li>
            <li>Blank cards (just "???") make great wild cards for advanced players</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
