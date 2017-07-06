#!/usr/bin/env ruby

require 'set'

class Event
  @@next_position = 0
  @@events = SortedSet.new

  @@message_symbols = {
    ':music:' => '♫♫♫♫♫',
    ':rocket:' => '🚀',
    ':sat:' => '🛰',
    ':satellite:' => '🛰'
  }

  def initialize time, message
    @time, @message = time, message
    @@message_symbols.each do |k,v| message[k] &&= v end  # substitute where possible

    # store the position of the event in the sequence
    @position = @@next_position
    @@next_position += 1

    # add to events set so we can get them later
    @@events.add(self)
  end

  # getters and setters
  def time=(time)         @time = time         end
  def message=(message)   @message = message   end
  def position=(position) @position = position end
  def position()          @position            end
  def self.all_events()   @@events             end

  def <=>(other) @position <=> other.position end
  def to_s() "| #{@time} | #{@message} |" end

  def self.reddit_format
    str = "| Time | Update |\n| --- | --- |"
    @@events.each do |event|
      str += "\n#{event}"
    end
    str
  end
end
